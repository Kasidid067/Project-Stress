import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        if (
            !session?.user ||
            session.user.role !== Role.STUDENT
        ) {
            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                }
            );
        }

        const userId = Number(session.user.id);

        const notifications =
            await prisma.notification.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

        const unreadCount =
            notifications.filter(
                (notification) =>
                    !notification.isRead
            ).length;

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error(
            "Get notifications error:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้",
            },
            {
                status: 500,
            }
        );
    }
}