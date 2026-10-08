import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Role,
  StudentSupportRequestStatus,
  StudentSupportRequestType,
  UserStatus,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

async function authorize() {
  const session = await auth();
  return session?.user?.role === Role.ADMIN ? session : null;
}

export async function GET() {
  const session = await authorize();
  if (!session) return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });

  const [requests, advisors] = await Promise.all([
    prisma.studentSupportRequest.findMany({
      include: {
        student: {
          select: {
            id: true, studentId: true, fullname: true, email: true,
            major: { select: { name: true } },
            advisor: { select: { id: true, fullname: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.user.findMany({
      where: { role: Role.ADVISOR, status: UserStatus.ACTIVE },
      select: { id: true, fullname: true },
      orderBy: { fullname: "asc" },
    }),
  ]);
  return NextResponse.json({ requests, advisors });
}

export async function POST(request: NextRequest) {
  const session = await authorize();
  if (!session) return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });

  const body = await request.json();
  const requestId = Number(body.requestId);
  const status = body.status as StudentSupportRequestStatus;
  const response = String(body.response ?? "").trim();
  const advisorId = body.advisorId ? Number(body.advisorId) : null;

  if (!Number.isInteger(requestId) || (status !== StudentSupportRequestStatus.RESOLVED && status !== StudentSupportRequestStatus.REJECTED)) {
    return NextResponse.json({ message: "ข้อมูลการดำเนินการไม่ถูกต้อง" }, { status: 400 });
  }

  const supportRequest = await prisma.studentSupportRequest.findUnique({ where: { id: requestId } });
  if (!supportRequest || supportRequest.status !== StudentSupportRequestStatus.PENDING) {
    return NextResponse.json({ message: "ไม่พบคำขอที่รอดำเนินการ" }, { status: 404 });
  }
  if (supportRequest.type === StudentSupportRequestType.ADVISOR_CHANGE && status === StudentSupportRequestStatus.RESOLVED && !advisorId) {
    return NextResponse.json({ message: "กรุณาเลือกอาจารย์ที่ปรึกษาใหม่ก่อนดำเนินการ" }, { status: 400 });
  }
  if (advisorId) {
    const advisor = await prisma.user.findFirst({ where: { id: advisorId, role: Role.ADVISOR, status: UserStatus.ACTIVE }, select: { id: true } });
    if (!advisor) return NextResponse.json({ message: "ไม่พบอาจารย์ที่ปรึกษาที่เลือก" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    if (supportRequest.type === StudentSupportRequestType.ADVISOR_CHANGE && status === StudentSupportRequestStatus.RESOLVED) {
      await tx.user.update({ where: { id: supportRequest.studentId }, data: { advisorId } });
    }
    await tx.studentSupportRequest.update({
      where: { id: requestId },
      data: { status, response: response || null, handledById: Number(session.user.id), handledAt: new Date() },
    });
    await tx.notification.create({
      data: {
        userId: supportRequest.studentId,
        title: "ผลคำขอปรับข้อมูล",
        message: status === StudentSupportRequestStatus.RESOLVED ? "คำขอของคุณได้รับการดำเนินการแล้ว" : "คำขอของคุณไม่ได้รับการอนุมัติ กรุณาตรวจสอบรายละเอียด",
        type: "GENERAL",
      },
    });
  });

  return NextResponse.json({ success: true });
}
