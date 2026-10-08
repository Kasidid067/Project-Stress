import { prisma } from "@/lib/prisma";
import { PulseMeasurementStatus, Role, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SensorPulsePayload = {
  measurementToken?: unknown;
  studentId?: unknown;
  bpm?: unknown;
  samples?: unknown;
  measuredAt?: unknown;
};

/**
 * จุดรับข้อมูลชีพจรจากบอร์ดเซ็นเซอร์ XD-58C
 *
 * การตั้งค่าก่อนต่อบอร์ด:
 * 1. ตั้งค่า SENSOR_API_KEY ในไฟล์ .env ของเว็บ แล้วรีสตาร์ต Next.js
 * 2. ตั้งค่า SENSOR_API_KEY เดียวกันในเฟิร์มแวร์บอร์ด (ห้ามใส่ NEXT_PUBLIC_ นำหน้า)
 * 3. ตั้งค่า URL เป็น https://โดเมนของคุณ/api/sensor/pulse
 *    - ขณะพัฒนา บอร์ดต้องเข้าถึง IP เครื่องที่รันเว็บได้ เช่น http://192.168.x.x:3001
 *    - ห้ามใช้ localhost บนบอร์ด เพราะ localhost จะหมายถึงตัวบอร์ดเอง
 * 4. สำหรับบอร์ดส่วนกลาง: รับ token จาก /api/sensor/pulse/command แล้วส่งกลับ:
 *    { "measurementToken": "...", "bpm": 72 }
 * 5. bpm ต้องเป็นจำนวนเต็ม 30-220,
 *    measuredAt ไม่บังคับ หากไม่ส่งระบบจะใช้เวลาที่รับข้อมูล
 * 6. XD-58C ส่งสัญญาณชีพจรเท่านั้น: เฟิร์มแวร์บนบอร์ดต้องคำนวณสัญญาณดิบ
 *    ให้เป็นค่า BPM ก่อน แล้วจึงส่งค่า bpm มาที่ปลายทางนี้
 *
 * หมายเหตุ: measurementToken ผูกกับบัญชีของผู้กดปุ่มวัดบนเว็บและหมดอายุภายใน 2 นาที
 * ไม่ควรฝังคีย์จริงไว้ในโค้ดที่ส่งขึ้น Git หรือเปิด API นี้สู่สาธารณะโดยไม่มี HTTPS
 */
export async function POST(request: NextRequest) {
  const configuredKey = process.env.SENSOR_API_KEY;
  const receivedKey = request.headers.get("x-sensor-api-key");

  if (!configuredKey) {
    return NextResponse.json(
      { message: "ยังไม่ได้ตั้งค่ากุญแจสำหรับเซ็นเซอร์บนเซิร์ฟเวอร์" },
      { status: 503 }
    );
  }

  if (!receivedKey || receivedKey !== configuredKey) {
    return NextResponse.json({ message: "ไม่ได้รับอนุญาตให้ส่งข้อมูลเซ็นเซอร์" }, { status: 401 });
  }

  let body: SensorPulsePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "รูปแบบข้อมูลต้องเป็น JSON" }, { status: 400 });
  }

  const measurementToken = String(body.measurementToken ?? "").trim();
  const studentId = String(body.studentId ?? "").trim();
  const bpm = Number(body.bpm);
  const samples = Array.isArray(body.samples)
    ? body.samples.map((value) => Number(value))
    : null;
  const measuredAt = body.measuredAt ? new Date(String(body.measuredAt)) : new Date();

  if (!Number.isInteger(bpm) || bpm < 30 || bpm > 220) {
    return NextResponse.json({ message: "ชีพจรต้องเป็นจำนวนเต็มระหว่าง 30-220 ครั้งต่อนาที" }, { status: 400 });
  }
  if (samples && (samples.length < 1 || samples.length > 3 || samples.some((value) => !Number.isInteger(value) || value < 30 || value > 220))) {
    return NextResponse.json({ message: "ค่าชีพจรต้องมี 1-3 ค่า และอยู่ระหว่าง 30-220 BPM" }, { status: 400 });
  }
  if (Number.isNaN(measuredAt.getTime())) {
    return NextResponse.json({ message: "รูปแบบเวลาที่วัดไม่ถูกต้อง" }, { status: 400 });
  }

  if (measurementToken) {
    const measurement = await prisma.pulseMeasurementSession.findUnique({ where: { token: measurementToken } });
    if (!measurement || measurement.status !== PulseMeasurementStatus.MEASURING || measurement.expiresAt <= new Date()) {
      return NextResponse.json({ message: "คำสั่งวัดหมดอายุหรือถูกใช้ไปแล้ว" }, { status: 409 });
    }

    if (samples && samples.length < 3) {
      const updated = await prisma.pulseMeasurementSession.update({
        where: { id: measurement.id },
        data: { samples },
        select: { id: true, status: true, samples: true },
      });
      return NextResponse.json({ success: true, status: "MEASURING", measurement: updated });
    }

    const averageBpm = samples
      ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length)
      : bpm;
    const record = await prisma.$transaction(async (tx) => {
      const saved = await tx.pulseRecord.create({
        data: { userId: measurement.userId, bpm: averageBpm, recordedAt: measuredAt },
        select: { id: true, bpm: true, recordedAt: true },
      });
      await tx.pulseMeasurementSession.update({
        where: { id: measurement.id },
        data: {
          status: PulseMeasurementStatus.COMPLETED,
          bpm: averageBpm,
          samples: samples ?? undefined,
          completedAt: new Date(),
        },
      });
      return saved;
    });
    return NextResponse.json({ success: true, record }, { status: 201 });
  }

  // โหมดเดิมสำหรับอุปกรณ์ส่วนตัวที่ระบุรหัสนิสิตเอง
  if (!studentId) return NextResponse.json({ message: "กรุณาระบุรหัสนิสิตหรือรหัสคำสั่งวัด" }, { status: 400 });
  const student = await prisma.user.findFirst({ where: { studentId, role: Role.STUDENT, status: UserStatus.ACTIVE }, select: { id: true } });
  if (!student) return NextResponse.json({ message: "ไม่พบบัญชีนิสิตที่ใช้งานอยู่" }, { status: 404 });
  const record = await prisma.pulseRecord.create({ data: { userId: student.id, bpm, recordedAt: measuredAt }, select: { id: true, bpm: true, recordedAt: true } });

  return NextResponse.json({ success: true, record }, { status: 201 });
}
