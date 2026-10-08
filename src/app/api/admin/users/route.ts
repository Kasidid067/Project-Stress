import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return NextResponse.json(
                { message: "ไม่มีสิทธิ์ดำเนินการ" },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            include: {
                major: true,
                track: true,
                advisor: {
                    select: {
                        id: true,
                        fullname: true,
                    },
                },
            },
            orderBy: {
                fullname: "asc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "เกิดข้อผิดพลาดในระบบ",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();

        const exists = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        studentId: body.studentId,
                    },
                    {
                        email: body.email,
                    },
                ],
            },
        });

        if (exists) {
            return NextResponse.json(
                {
                    message: "รหัสผู้ใช้งานหรืออีเมลถูกใช้งานแล้ว",
                },
                {
                    status: 400,
                }
            );
        }

        const password = await bcrypt.hash(
            body.password,
            10
        );

        const user = await prisma.user.create({
            data: {
                studentId: body.studentId,
                fullname: body.fullname,
                email: body.email,
                phone: body.phone,
                password,
                role: body.role,
                status: body.status ?? UserStatus.ACTIVE,
                majorId: Number(body.majorId),
                trackId: body.trackId ? Number(body.trackId) : null,
                advisorId: body.advisorId
                    ? Number(body.advisorId)
                    : null,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "เกิดข้อผิดพลาดในระบบ",
            },
            {
                status: 500,
            }
        );
    }
}
