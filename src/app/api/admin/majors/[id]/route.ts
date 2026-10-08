import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (
        !session?.user ||
        session.user.role !== "ADMIN"
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

    const { id } = await params;

    const body = await req.json();

    const major = await prisma.major.update({
        where: {
            id: Number(id),
        },
        data: {
            name: body.name,
        },
    });

    return NextResponse.json(major);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (
        !session?.user ||
        session.user.role !== "ADMIN"
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

    const { id } = await params;

    const majorId = Number(id);

    const deleteStudents =
        req.nextUrl.searchParams.get(
            "deleteStudents"
        ) === "true";

    /*
     * ตรวจสอบว่าหลักสูตรมีอยู่จริงหรือไม่
     */
    const major = await prisma.major.findUnique({
        where: {
            id: majorId,
        },
    });

    if (!major) {
        return NextResponse.json(
            {
                message: "ไม่พบหลักสูตรที่ต้องการลบ",
            },
            {
                status: 404,
            }
        );
    }

    /*
     * นับเฉพาะนิสิต
     */
    const studentCount =
        await prisma.user.count({
            where: {
                majorId,
                role: "STUDENT",
            },
        });

    /*
     * ถ้ามีนิสิต และยังไม่ได้ยืนยัน
     * ให้ส่งจำนวนกลับไปก่อน
     */
    if (
        studentCount > 0 &&
        !deleteStudents
    ) {
        return NextResponse.json(
            {
                message:
                    `หลักสูตรนี้มีนิสิตอยู่ ${studentCount} คน หากลบหลักสูตร นิสิตที่อยู่ในหลักสูตรนี้จะถูกลบด้วย`,
                studentCount,
            },
            {
                status: 409,
            }
        );
    }

    /*
     * ถ้ายืนยันให้ลบนิสิตด้วย
     * ทำทั้งหมดใน Transaction
     */
    try {
        await prisma.$transaction(
            async (tx) => {
                if (
                    deleteStudents &&
                    studentCount > 0
                ) {
                    await tx.user.deleteMany({
                        where: {
                            majorId,
                            role: "STUDENT",
                        },
                    });
                }

                await tx.major.delete({
                    where: {
                        id: majorId,
                    },
                });
            }
        );
    } catch (error) {
        console.error(
            "Delete major error:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "ไม่สามารถลบหลักสูตรได้ เนื่องจากยังมีข้อมูลที่เกี่ยวข้องอยู่",
            },
            {
                status: 409,
            }
        );
    }

    return NextResponse.json({
        success: true,
        deletedStudents: studentCount,
    });
}
