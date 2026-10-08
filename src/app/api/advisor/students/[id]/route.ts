import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function GET(
    request: Request,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    try {
        const session = await auth();

        if (
            !session?.user ||
            session.user.role !== Role.ADVISOR
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

        // ✅ Next.js 15/16 ต้อง await params
        const { id } = await params;

        const advisorId = Number(session.user.id);

        const student = await prisma.user.findFirst({
            where: {
                id: Number(id),
                advisorId,
                role: Role.STUDENT,
            },
            include: {
                major: true,

                results: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: {
                        pulse: true,
                        assessment: {
                            include: {
                                answers: {
                                    orderBy: {
                                        questionNo: "asc",
                                    },
                                },
                            },
                        },
                    },
                },

                activityLogs: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: {
                        activity: true,
                    },
                },

                pulses: {
                    orderBy: {
                        recordedAt: "desc",
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json(
                {
                    message: "ไม่พบนิสิต",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("Advisor Student Detail Error");
        console.error(error);

        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}
