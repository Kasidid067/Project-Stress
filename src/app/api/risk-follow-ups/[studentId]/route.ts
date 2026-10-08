import { Role, StudentRiskFollowUpStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = new Set(Object.values(StudentRiskFollowUpStatus));

async function canManageStudent(studentId: number, userId: number, role: Role) {
  if (role === Role.STAFF) {
    return prisma.user.findFirst({ where: { id: studentId, role: Role.STUDENT }, select: { id: true } });
  }
  if (role === Role.ADVISOR) {
    return prisma.user.findFirst({ where: { id: studentId, role: Role.STUDENT, advisorId: userId }, select: { id: true } });
  }
  return null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== Role.ADVISOR && session.user.role !== Role.STAFF)) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  }
  const { studentId: studentIdText } = await params;
  const studentId = Number(studentIdText);
  const userId = Number(session.user.id);
  if (!Number.isInteger(studentId) || !(await canManageStudent(studentId, userId, session.user.role))) {
    return NextResponse.json({ message: "ไม่พบนิสิต หรือไม่มีสิทธิ์เข้าถึง" }, { status: 404 });
  }

  const followUps = await prisma.studentRiskFollowUp.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: { handledBy: { select: { fullname: true, role: true } } },
  });
  return NextResponse.json({ followUps });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== Role.ADVISOR && session.user.role !== Role.STAFF)) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  }
  const { studentId: studentIdText } = await params;
  const studentId = Number(studentIdText);
  const handledById = Number(session.user.id);
  if (!Number.isInteger(studentId) || !(await canManageStudent(studentId, handledById, session.user.role))) {
    return NextResponse.json({ message: "ไม่พบนิสิต หรือไม่มีสิทธิ์เข้าถึง" }, { status: 404 });
  }

  const body = (await request.json()) as { status?: unknown; note?: unknown; nextFollowUpAt?: unknown };
  const status = String(body.status ?? "") as StudentRiskFollowUpStatus;
  const note = String(body.note ?? "").trim();
  const nextFollowUpAtText = String(body.nextFollowUpAt ?? "").trim();
  const nextFollowUpAt = nextFollowUpAtText ? new Date(`${nextFollowUpAtText}T00:00:00`) : null;

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ message: "สถานะการติดตามไม่ถูกต้อง" }, { status: 400 });
  }
  if (note.length > 2000) {
    return NextResponse.json({ message: "โน้ตต้องมีความยาวไม่เกิน 2,000 ตัวอักษร" }, { status: 400 });
  }
  if (nextFollowUpAt && Number.isNaN(nextFollowUpAt.getTime())) {
    return NextResponse.json({ message: "วันนัดติดตามไม่ถูกต้อง" }, { status: 400 });
  }
  if (status === StudentRiskFollowUpStatus.FOLLOW_UP_SCHEDULED && !nextFollowUpAt) {
    return NextResponse.json({ message: "กรุณาระบุวันนัดติดตามครั้งถัดไป" }, { status: 400 });
  }

  const followUp = await prisma.studentRiskFollowUp.create({
    data: { studentId, handledById, status, note: note || null, nextFollowUpAt: status === StudentRiskFollowUpStatus.CLOSED ? null : nextFollowUpAt },
    include: { handledBy: { select: { fullname: true, role: true } } },
  });
  return NextResponse.json({ followUp, message: "บันทึกการติดตามเรียบร้อยแล้ว" }, { status: 201 });
}
