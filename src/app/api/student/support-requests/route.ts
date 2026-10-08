import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Role,
  StudentSupportRequestStatus,
  StudentSupportRequestType,
  UserStatus,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const requestLabels: Record<StudentSupportRequestType, string> = {
  ADVISOR_CHANGE: "ขอเปลี่ยนอาจารย์ที่ปรึกษา",
  PROFILE_CORRECTION: "แจ้งข้อมูลส่วนตัวไม่ถูกต้อง",
};

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  }

  const requests = await prisma.studentSupportRequest.findMany({
    where: { studentId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  }

  const body = await request.json();
  const type = body.type as StudentSupportRequestType;
  const details = String(body.details ?? "").trim();

  if (!Object.values(StudentSupportRequestType).includes(type)) {
    return NextResponse.json({ message: "ประเภทคำขอไม่ถูกต้อง" }, { status: 400 });
  }
  if (details.length < 10 || details.length > 1000) {
    return NextResponse.json({ message: "กรุณาระบุรายละเอียดตั้งแต่ 10 ถึง 1,000 ตัวอักษร" }, { status: 400 });
  }

  const studentId = Number(session.user.id);
  const pending = await prisma.studentSupportRequest.findFirst({
    where: { studentId, type, status: StudentSupportRequestStatus.PENDING },
    select: { id: true },
  });
  if (pending) {
    return NextResponse.json({ message: "คุณมีคำขอประเภทนี้ที่กำลังรอดำเนินการอยู่" }, { status: 409 });
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { fullname: true },
  });
  const recipients = await prisma.user.findMany({
    where: {
      role: { in: [Role.ADMIN, Role.STAFF] },
      status: UserStatus.ACTIVE,
    },
    select: { id: true },
  });

  const supportRequest = await prisma.$transaction(async (tx) => {
    const created = await tx.studentSupportRequest.create({
      data: { studentId, type, details },
    });
    if (recipients.length > 0) {
      await tx.notification.createMany({
        data: recipients.map((recipient) => ({
          userId: recipient.id,
          title: "มีคำขอปรับข้อมูลใหม่",
          message: `${student?.fullname ?? "นิสิต"} ส่งคำขอ${requestLabels[type]}`,
          type: "GENERAL",
        })),
      });
    }
    return created;
  });

  return NextResponse.json({ supportRequest }, { status: 201 });
}
