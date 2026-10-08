import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.isRead).length,
  });
}
