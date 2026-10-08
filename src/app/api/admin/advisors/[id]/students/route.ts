import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function GET(
    _request: Request,
    context: {
        params: Promise<{ id: string }>;
    }
) {
    try {
        const session = await auth();

        // เฉพาะ Admin เท่านั้น
        if (
            !session?.user ||
            session.user.role !== Role.ADMIN
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

        const { id } = await context.params;
        const advisorId = Number(id);

        // ตรวจสอบ ID อาจารย์
        if (!Number.isInteger(advisorId)) {
            return NextResponse.json(
                {
                    message:
                        "รหัสอาจารย์ไม่ถูกต้อง",
                },
                {
                    status: 400,
                }
            );
        }

        // ตรวจสอบว่า User นี้เป็นอาจารย์จริงหรือไม่
        const advisor =
            await prisma.user.findFirst({
                where: {
                    id: advisorId,
                    role: Role.ADVISOR,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                },
            });

        if (!advisor) {
            return NextResponse.json(
                {
                    message:
                        "ไม่พบข้อมูลอาจารย์",
                },
                {
                    status: 404,
                }
            );
        }

        // ดึงนิสิตที่มี advisorId ตรงกับอาจารย์
        const students =
            await prisma.user.findMany({
                where: {
                    advisorId: advisorId,
                    role: Role.STUDENT,
                },
                select: {
                    id: true,
                    studentId: true,
                    fullname: true,
                    email: true,
                    phone: true,
                    status: true,
                    major: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    fullname: "asc",
                },
            });

        return NextResponse.json({
            advisor,
            totalStudents: students.length,
            students,
        });
    } catch (error) {
        console.error(
            "GET advisor students error:",
            error
        );

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
