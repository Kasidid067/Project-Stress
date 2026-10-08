import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// =========================
// GET : ดึงรายการหลักสูตรทั้งหมด
// =========================
export async function GET() {
    try {
        const majors = await prisma.major.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                tracks: { orderBy: { name: "asc" } },
            },
        });

        return NextResponse.json(majors);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "ไม่สามารถโหลดข้อมูลหลักสูตรได้",
            },
            {
                status: 500,
            }
        );
    }
}

// =========================
// POST : เพิ่มหลักสูตรใหม่
// =========================
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await req.json();

        if (!body.name || body.name.trim() === "") {
            return NextResponse.json(
                {
                    message: "กรุณาระบุชื่อหลักสูตร",
                },
                {
                    status: 400,
                }
            );
        }

        const exists = await prisma.major.findFirst({
            where: {
                name: body.name.trim(),
            },
        });

        if (exists) {
            return NextResponse.json(
                {
                    message: "มีหลักสูตรนี้อยู่แล้ว",
                },
                {
                    status: 400,
                }
            );
        }

        const major = await prisma.major.create({
            data: {
                name: body.name.trim(),
            },
        });

        return NextResponse.json(major, {
            status: 201,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "เกิดข้อผิดพลาดของ Server",
            },
            {
                status: 500,
            }
        );
    }
}
