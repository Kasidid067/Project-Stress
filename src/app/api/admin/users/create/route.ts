import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth();

    if (
        !session?.user ||
        session.user.role !== "ADMIN"
    ) {
        return NextResponse.json(
            {
                    message: "ไม่มีสิทธิ์ดำเนินการ",
            },
            {
                status: 403,
            }
        );
    }

    try {
        const body = await req.json();

        const {
            studentId,
            fullname,
            email,
            phone,
            password,
            role,
            majorId,
            trackId,
            advisorId,
        } = body;

        /*
         * ==========================================
         * ตรวจสอบข้อมูลพื้นฐาน
         * ==========================================
         */

        if (
            !studentId ||
            !fullname ||
            !email ||
            !password
        ) {
            return NextResponse.json(
                {
                    message:
                        "กรุณากรอกข้อมูลให้ครบ",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ==========================================
         * ตรวจสอบสิทธิ์การสร้าง Role
         * ==========================================
         */

        const actorIsSuperAdmin =
            Boolean(
                (session.user as any)
                    .isSuperAdmin
            );

        const requestedRole = role || Role.STUDENT;

        if (!Object.values(Role).includes(requestedRole)) {
            return NextResponse.json(
                { message: "สิทธิ์ผู้ใช้งานไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        /*
         * ADMIN ปกติ
         * สามารถสร้างได้เฉพาะ
         * STUDENT / ADVISOR / STAFF
         */
        if (
            !actorIsSuperAdmin &&
            requestedRole === "ADMIN"
        ) {
            return NextResponse.json(
                {
                    message:
                        "ADMIN ปกติไม่มีสิทธิ์สร้าง ADMIN",
                },
                {
                    status: 403,
                }
            );
        }

        /*
         * ป้องกันการส่ง isSuperAdmin
         * เข้ามาจาก Frontend
         */
        if (
            body.isSuperAdmin === true &&
            !actorIsSuperAdmin
        ) {
            return NextResponse.json(
                {
                    message:
                        "คุณไม่มีสิทธิ์สร้าง Super Admin",
                },
                {
                    status: 403,
                }
            );
        }

        /*
         * ==========================================
         * ตรวจสอบ Student ID
         * ==========================================
         */

        const existsStudent =
            await prisma.user.findUnique({
                where: {
                    studentId,
                },
            });

        if (existsStudent) {
            return NextResponse.json(
                {
                    message:
                        "รหัสผู้ใช้งานนี้ถูกใช้งานแล้ว",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ==========================================
         * ตรวจสอบ Email
         * ==========================================
         */

        const existsEmail =
            await prisma.user.findUnique({
                where: {
                    email,
                },
            });

        if (existsEmail) {
            return NextResponse.json(
                {
                    message:
                        "อีเมลนี้ถูกใช้งานแล้ว",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ==========================================
         * Hash Password
         * ==========================================
         */

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        /*
         * ==========================================
         * สร้าง User
         *
         * isSuperAdmin ถูกกำหนดเป็น false
         * เสมอจากการสร้างปกติ
         *
         * การกำหนด Super Admin จะทำแยก
         * ไม่ให้ Frontend ส่งเข้ามาเอง
         * ==========================================
         */

        const requiresMajor =
            requestedRole === Role.STUDENT ||
            requestedRole === Role.ADVISOR;

        let resolvedMajorId =
            requiresMajor ? Number(majorId) : null;

        if (!resolvedMajorId || Number.isNaN(resolvedMajorId)) {
            const fallbackMajor = await prisma.major.findFirst({
                orderBy: { id: "asc" },
                select: { id: true },
            });

            if (!fallbackMajor) {
                return NextResponse.json(
                    { message: "กรุณาเพิ่มข้อมูลหลักสูตรก่อนเพิ่มผู้ใช้งาน" },
                    { status: 400 }
                );
            }

            resolvedMajorId = fallbackMajor.id;
        }

        const resolvedTrackId = trackId ? Number(trackId) : null;
        if (resolvedTrackId && !(await prisma.majorTrack.findFirst({ where: { id: resolvedTrackId, majorId: resolvedMajorId }, select: { id: true } }))) {
            return NextResponse.json({ message: "วิชาเอกไม่อยู่ในหลักสูตรที่เลือก" }, { status: 400 });
        }

        const user =
            await prisma.user.create({
                data: {
                    studentId,
                    fullname,
                    email,
                    phone,
                    password:
                        hashedPassword,
                    role: requestedRole,
                    isSuperAdmin: false,
                    // ฐานข้อมูลยังบังคับให้ผู้ใช้ต้องมี majorId
                    // จึงใช้หลักสูตรแรกเป็นข้อมูลภายในสำหรับผู้ดูแล/เจ้าหน้าที่
                    // โดยจะไม่แสดงในหน้าจัดการผู้ใช้
                    majorId: resolvedMajorId,
                    trackId: requestedRole === Role.STUDENT ? resolvedTrackId : null,
                    advisorId:
                        requestedRole === Role.STUDENT && advisorId
                            ? Number(advisorId)
                            : null,
                },
            });

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(
            "Create user error:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "เกิดข้อผิดพลาดในระบบ",
            },
            {
                status: 500,
            }
        );
    }
}
