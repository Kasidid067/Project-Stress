import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const notificationId = Number(id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return NextResponse.json({ message: "Notification ID ไม่ถูกต้อง" }, { status: 400 });
  }

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId: Number(session.user.id) },
  });

  if (!notification) {
    return NextResponse.json({ message: "ไม่พบการแจ้งเตือน" }, { status: 404 });
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true, notification: updatedNotification });
}
