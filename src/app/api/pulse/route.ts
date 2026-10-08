import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function GET() {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    const records =
        await prisma.pulseRecord.findMany({
            where: {
                userId:
                    Number(session.user.id),
            },
            orderBy: {
                recordedAt: "desc",
            },
        });

    return NextResponse.json(records);
}

export async function POST(
    request: Request
) {
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

    /*
     * ==========================================
     * รองรับการส่งค่าจากการวัดของระบบ
     * หรือการกรอกค่าด้วยตนเอง
     * ==========================================
     */

    let body: {
        bpm?: number;
    } = {};

    try {
        body = await request.json();
    } catch {
        body = {};
    }

    /*
     * ถ้ามี BPM จาก Client
     * = ใช้ค่าที่นิสิตกรอก
     *
     * ถ้าไม่มี
     * = จำลองค่าการวัดเดิม
     */

    let bpm: number;

    if (
        typeof body.bpm === "number" &&
        Number.isFinite(body.bpm)
    ) {
        bpm = body.bpm;
    } else {
        bpm =
            Math.floor(
                Math.random() * 41
            ) + 60;
    }

    /*
     * ตรวจสอบ BPM
     */

    if (
        !Number.isInteger(bpm) ||
        bpm < 30 ||
        bpm > 220
    ) {
        return NextResponse.json(
            {
                message:
                    "ค่า BPM ไม่ถูกต้อง",
            },
            {
                status: 400,
            }
        );
    }

    /*
     * บันทึกข้อมูล
     */

    const record =
        await prisma.pulseRecord.create({
            data: {
                userId:
                    Number(session.user.id),
                bpm,
            },
        });

    return NextResponse.json(record);
}
