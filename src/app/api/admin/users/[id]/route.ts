import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

function isSuperAdmin(session: any) {
    return (
        session?.user?.role === "ADMIN" &&
        session?.user?.isSuperAdmin === true
    );
}

function isAdmin(session: any) {
    return session?.user?.role === "ADMIN";
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!isAdmin(session)) {
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

    const user = await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            major: true,
            track: true,
            advisor: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            {
                message: "ไม่พบผู้ใช้งาน",
            },
            {
                status: 404,
            }
        );
    }

    return NextResponse.json(user);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const userId = Number(id);

    const currentUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!currentUser) {
        return NextResponse.json(
            {
                message: "ไม่พบผู้ใช้งาน",
            },
            {
                status: 404,
            }
        );
    }

    const body = await req.json();

    const actorId = Number(session.user.id);

    const actorIsSuperAdmin =
        isSuperAdmin(session);

    // บัญชีผู้ดูแลแก้ไขได้เฉพาะเจ้าของบัญชีเท่านั้น
    // ใช้กฎนี้กับ Super Admin ด้วย เพื่อไม่ให้ผู้ดูแลแก้ข้อมูลส่วนตัวกันเอง
    const isOwnAdminAccount =
        currentUser.role === "ADMIN" &&
        currentUser.id === actorId;

    if (currentUser.role === "ADMIN" && !isOwnAdminAccount) {
        return NextResponse.json(
            {
                message: "ผู้ดูแลระบบแก้ไขข้อมูลของผู้ดูแลระบบคนอื่นไม่ได้",
            },
            {
                status: 403,
            }
        );
    }

    /*
     * ==========================================
     * ป้องกันการแก้ไข Super Admin
     * ==========================================
     *
     * แม้แต่ Super Admin ก็ไม่สามารถ
     * เปลี่ยน Role / Status ของ Super Admin ได้
     */

    if (currentUser.isSuperAdmin) {
        if (!actorIsSuperAdmin) {
            return NextResponse.json(
                {
                    message:
                        "คุณไม่มีสิทธิ์แก้ไข Super Admin",
                },
                {
                    status: 403,
                }
            );
        }

        if (
            body.role &&
            body.role !== "ADMIN"
        ) {
            return NextResponse.json(
                {
                    message:
                        "ไม่สามารถเปลี่ยน Role ของ Super Admin ได้",
                },
                {
                    status: 403,
                }
            );
        }

        if (
            body.status &&
            body.status !== currentUser.status
        ) {
            return NextResponse.json(
                {
                    message:
                        "ไม่สามารถเปลี่ยนสถานะของ Super Admin ได้",
                },
                {
                    status: 403,
                }
            );
        }
    }

    /*
     * ==========================================
     * ADMIN ปกติ
     * ==========================================
     *
     * ไม่สามารถจัดการ ADMIN
     * และไม่สามารถเลื่อน User เป็น ADMIN
     */

    if (!actorIsSuperAdmin) {
        if (
            currentUser.role === "ADMIN"
        ) {
            return NextResponse.json(
                {
                    message:
                        "ADMIN ปกติไม่มีสิทธิ์แก้ไข ADMIN",
                },
                {
                    status: 403,
                }
            );
        }

        if (
            body.role === "ADMIN"
        ) {
            return NextResponse.json(
                {
                    message:
                        "ADMIN ปกติไม่มีสิทธิ์กำหนด Role เป็น ADMIN",
                },
                {
                    status: 403,
                }
            );
        }
    }

    const updateData: {
        fullname?: string;
        email?: string;
        phone?: string | null;
        role?: any;
        majorId?: number;
        trackId?: number | null;
        advisorId?: number | null;
        status?: any;
        password?: string;
    } = isOwnAdminAccount
        ? {
            // เจ้าของบัญชี ADMIN แก้ได้เฉพาะข้อมูลส่วนตัว
            fullname: body.fullname,
            email: body.email,
            phone: body.phone,
        }
        : {
            fullname: body.fullname,
            email: body.email,
            phone: body.phone,
            role: body.role,
            majorId: body.majorId,
            status: body.status,
        };

    if (!isOwnAdminAccount && "advisorId" in body) {
        updateData.advisorId =
            body.advisorId || null;
    }

    if (!isOwnAdminAccount && "trackId" in body) {
        updateData.trackId = body.trackId ? Number(body.trackId) : null;
    }

    /*
     * ==========================================
     * ป้องกันการแก้ไขตัวเองเป็น Role อื่น
     * ==========================================
     */

    if (currentUser.id === actorId) {
        if (
            body.role &&
            body.role !== currentUser.role
        ) {
            return NextResponse.json(
                {
                    message:
                        "ไม่สามารถเปลี่ยน Role ของบัญชีที่กำลังใช้งานอยู่ได้",
                },
                {
                    status: 403,
                }
            );
        }

        if (
            body.status &&
            body.status !== currentUser.status
        ) {
            return NextResponse.json(
                {
                    message:
                        "ไม่สามารถเปลี่ยนสถานะของบัญชีที่กำลังใช้งานอยู่ได้",
                },
                {
                    status: 403,
                }
            );
        }
    }

    /*
     * ==========================================
     * เปลี่ยน Password เฉพาะเมื่อกรอกมา
     * ==========================================
     */

    if (body.password) {
        updateData.password =
            await bcrypt.hash(
                body.password,
                10
            );
    }

    /*
     * ==========================================
     * อัปเดตข้อมูล
     * ==========================================
     */

    try {
        const user =
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: updateData,
            });

        return NextResponse.json(user);
    } catch (error) {
        console.error(
            "Update user error:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "แก้ไขผู้ใช้งานไม่สำเร็จ",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const userId = Number(id);

    const currentUser =
        await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

    if (!currentUser) {
        return NextResponse.json(
            {
                message:
                    "ไม่พบผู้ใช้งาน",
            },
            {
                status: 404,
            }
        );
    }

    const actorId = Number(
        session.user.id
    );

    const actorIsSuperAdmin =
        isSuperAdmin(session);

    /*
     * ==========================================
     * ห้ามลบตัวเอง
     * ==========================================
     */

    if (userId === actorId) {
        return NextResponse.json(
            {
                message:
                    "ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้",
            },
            {
                status: 403,
            }
        );
    }

    /*
     * ==========================================
     * ห้ามลบ Super Admin
     * ==========================================
     */

    if (currentUser.isSuperAdmin) {
        return NextResponse.json(
            {
                message:
                    "ไม่สามารถลบ Super Admin ได้",
            },
            {
                status: 403,
            }
        );
    }

    /*
     * ==========================================
     * ADMIN ปกติ
     * ==========================================
     *
     * ไม่สามารถลบ ADMIN
     */

    if (
        !actorIsSuperAdmin &&
        currentUser.role === "ADMIN"
    ) {
        return NextResponse.json(
            {
                message:
                    "ADMIN ปกติไม่มีสิทธิ์ลบ ADMIN",
            },
            {
                status: 403,
            }
        );
    }

    /*
     * ==========================================
     * ลบผู้ใช้งาน
     * ==========================================
     */

    try {
        await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        return NextResponse.json({
            success: true,
            message:
                "ลบผู้ใช้งานสำเร็จ",
        });
    } catch (error) {
        console.error(
            "Delete user error:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "ลบผู้ใช้งานไม่สำเร็จ",
            },
            {
                status: 500,
            }
        );
    }
}
