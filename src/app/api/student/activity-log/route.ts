import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

const feedbackMoods = ["BETTER", "SAME", "WORSE"] as const;

export async function GET() {

    const session = await auth();

    if (
        !session?.user ||
        session.user.role !== Role.STUDENT
    ) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    const logs =
        await prisma.activityLog.findMany({
            where: {
                userId:
                    Number(session.user.id),
            },
            include: {
                activity: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    return NextResponse.json(
        logs
    );
}

export async function POST(
    req: Request
) {
    const session = await auth();
    if (
        !session?.user ||
        session.user.role !== Role.STUDENT
    ) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }
    const body =
        await req.json();

    const { activityId, feedbackMood, feedbackNote } = body;

    if (!Number.isInteger(activityId)) {
        return NextResponse.json(
            { message: "รหัสกิจกรรมไม่ถูกต้อง" },
            { status: 400 }
        );
    }

    if (!feedbackMoods.includes(feedbackMood)) {
        return NextResponse.json(
            { message: "กรุณาระบุความรู้สึกหลังทำกิจกรรม" },
            { status: 400 }
        );
    }

    if (
        feedbackNote !== undefined &&
        (typeof feedbackNote !== "string" || feedbackNote.length > 1000)
    ) {
        return NextResponse.json(
            { message: "ความคิดเห็นต้องมีความยาวไม่เกิน 1,000 ตัวอักษร" },
            { status: 400 }
        );
    }

    const exists =
        await prisma.activityLog.findFirst({
            where: {
                userId:
                    Number(session.user.id),
                activityId,
            },
        });
    if (exists) {
        return NextResponse.json(
            {
                message:
                    "ทำกิจกรรมนี้แล้ว",
            },
            {
                status: 400,
            }
        );
    }

    const log =
        await prisma.activityLog.create({
            data: {
                userId:
                    Number(session.user.id),
                activityId,
                completed: true,
                completedAt:
                    new Date(),
                feedbackMood,
                feedbackNote: feedbackNote?.trim() || null,
            },
        });
    return NextResponse.json(
        log
    );
}
