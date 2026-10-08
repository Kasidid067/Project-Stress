import { prisma } from "@/lib/prisma";
import { PulseMeasurementStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const configuredKey = process.env.SENSOR_API_KEY;
  return Boolean(configuredKey) && request.headers.get("x-sensor-api-key") === configuredKey;
}

// บอร์ดเรียกปลายทางนี้เป็นระยะเพื่อรับคิววัดเพียงหนึ่งรายการ
export async function GET(request: NextRequest) {
  if (!process.env.SENSOR_API_KEY) {
    return NextResponse.json({ message: "ยังไม่ได้ตั้งค่ากุญแจสำหรับเซ็นเซอร์บนเซิร์ฟเวอร์" }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "ไม่ได้รับอนุญาตให้รับคำสั่งจากเซ็นเซอร์" }, { status: 401 });
  }

  const now = new Date();
  // ESP32 เรียกปลายทางนี้ทุก 2 วินาที จึงใช้เป็นสัญญาณว่าอุปกรณ์ยังออนไลน์อยู่
  await prisma.sensorDeviceStatus.upsert({
    where: { id: "shared-xd58c" },
    create: { id: "shared-xd58c", lastSeenAt: now },
    update: { lastSeenAt: now },
  });

  await prisma.pulseMeasurementSession.updateMany({
    where: { status: { in: [PulseMeasurementStatus.PENDING, PulseMeasurementStatus.MEASURING] }, expiresAt: { lt: now } },
    data: { status: PulseMeasurementStatus.EXPIRED },
  });

  const queued = await prisma.pulseMeasurementSession.findFirst({
    where: { status: PulseMeasurementStatus.PENDING, expiresAt: { gt: now } },
    orderBy: { createdAt: "asc" },
  });
  if (!queued) return NextResponse.json({ command: null });

  const claimed = await prisma.pulseMeasurementSession.updateMany({
    where: { id: queued.id, status: PulseMeasurementStatus.PENDING },
    data: { status: PulseMeasurementStatus.MEASURING },
  });
  if (!claimed.count) return NextResponse.json({ command: null });

  return NextResponse.json({ command: { token: queued.token, expiresAt: queued.expiresAt } });
}
