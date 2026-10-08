import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const studentId = String(body.studentId ?? "").trim();
    const fullname = String(body.fullname ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const majorId = Number(body.majorId);
    const trackId = body.trackId ? Number(body.trackId) : null;
    const password = String(body.password ?? "");

    if (!studentId || !fullname || !phone || !email || !Number.isInteger(majorId) || majorId < 1 || !password) return NextResponse.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    if (!/^\d{1,10}$/.test(studentId)) return NextResponse.json({ success: false, message: "รหัสนิสิตต้องเป็นตัวเลขและมีความยาวไม่เกิน 10 หลัก" }, { status: 400 });
    if (!/^[^\s@]+@tsu\.ac\.th$/i.test(email)) return NextResponse.json({ success: false, message: "กรุณาใช้อีเมลมหาวิทยาลัยที่ลงท้ายด้วย @tsu.ac.th" }, { status: 400 });
    if (!/^\d{10}$/.test(phone)) return NextResponse.json({ success: false, message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก" }, { status: 400 });

    if (trackId && !(await (await import("@/lib/prisma")).prisma.majorTrack.findFirst({ where: { id: trackId, majorId }, select: { id: true } }))) return NextResponse.json({ success: false, message: "วิชาเอกไม่อยู่ในหลักสูตรที่เลือก" }, { status: 400 });
    await registerUser({ studentId, fullname, phone, email, majorId, trackId, password });
    return NextResponse.json({ success: true, message: "สมัครสมาชิกสำเร็จ" });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") return NextResponse.json({ success: false, message: "อีเมลหรือรหัสนิสิตนี้ถูกใช้งานแล้ว" }, { status: 400 });
    console.error(error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดของระบบ" }, { status: 500 });
  }
}
