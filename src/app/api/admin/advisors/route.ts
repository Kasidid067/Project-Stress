import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

// =========================
// GET : รายชื่ออาจารย์
// =========================
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const advisors = await prisma.user.findMany({
            where: {
                role: Role.ADVISOR,
            },
            select: {
                id: true,
                fullname: true,
                email: true,
            },
            orderBy: {
                fullname: "asc",
            },
        });

        return NextResponse.json(advisors);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Server Error",
            },
            {
                status: 500,
            }
        );
    }
}

// =========================
// PUT : กำหนดอาจารย์ที่ปรึกษา
// =========================
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const { studentId, advisorId } = await req.json();
        const studentUserId = Number(studentId);
        const advisorUserId = advisorId ? Number(advisorId) : null;

        if (!Number.isInteger(studentUserId) || studentUserId <= 0) {
            return NextResponse.json(
                { message: "รหัสนิสิตไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        const student = await prisma.user.findFirst({
            where: { id: studentUserId, role: Role.STUDENT },
            select: { id: true },
        });

        if (!student) {
            return NextResponse.json(
                { message: "ไม่พบข้อมูลนิสิต" },
                { status: 404 }
            );
        }

        if (advisorUserId !== null) {
            if (!Number.isInteger(advisorUserId) || advisorUserId <= 0) {
                return NextResponse.json(
                    { message: "รหัสอาจารย์ไม่ถูกต้อง" },
                    { status: 400 }
                );
            }

            const advisor = await prisma.user.findFirst({
                where: { id: advisorUserId, role: Role.ADVISOR },
                select: { id: true },
            });

            if (!advisor) {
                return NextResponse.json(
                    { message: "ไม่พบข้อมูลอาจารย์ที่ปรึกษา" },
                    { status: 404 }
                );
            }
        }

        await prisma.user.update({
            where: {
                id: studentUserId,
            },
            data: {
                advisorId: advisorUserId,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Server Error",
            },
            {
                status: 500,
            }
        );
    }
}
