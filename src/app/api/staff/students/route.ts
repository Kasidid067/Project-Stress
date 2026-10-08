import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role, StressLevel } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {

        const session = await auth();

        if (
            !session?.user ||
            session.user.role !== Role.STAFF
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

        const { searchParams } = new URL(req.url);

        const keyword =
            searchParams.get("keyword")?.trim() ?? "";

        const majorId =
            searchParams.get("majorId");

        const stressLevel =
            searchParams.get("stressLevel");

        const where: Prisma.UserWhereInput = {

                role: Role.STUDENT,

                ...(majorId &&
                    majorId !== "ALL" && {
                        majorId: Number(majorId),
                    }),

                ...(keyword && {

                    OR: [

                        {
                            fullname: {
                                contains: keyword,
                            },
                        },

                        {
                            studentId: {
                                contains: keyword,
                            },
                        },

                        {
                            email: {
                                contains: keyword,
                            },
                        },

                    ],

                }),

        };

        const students = await prisma.user.findMany({

            where,

            include: {

                major: true,

                results: {

                    orderBy: {
                        createdAt: "desc",
                    },

                    take: 1,

                    include: {

                        pulse: true,

                    },

                },

            },

            orderBy: {

                fullname: "asc",

            },

        });

        const data = students

            .filter((student) => {

                if (
                    !stressLevel ||
                    stressLevel === "ALL"
                ) {
                    return true;
                }

                const latest =
                    student.results[0];

                if (!latest) {

                    return false;

                }

                return (
                    latest.stressLevel ===
                    (stressLevel as StressLevel)
                );

            })

            .map((student) => {

                const latest =
                    student.results[0];

                return {

                    id: student.id,

                    studentId:
                        student.studentId,

                    fullname:
                        student.fullname,

                    email:
                        student.email,


                    major:
                        student.major,

                    latestResult: latest
                        ? {

                              score:
                                  latest.stressScore,

                              level:
                                  latest.stressLevel,

                              bpm:
                                  latest.pulse?.bpm ??
                                  null,

                              createdAt:
                                  latest.createdAt,

                          }
                        : null,

                };

            });

        return NextResponse.json(data);

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                message:
                    "Internal Server Error",
            },
            {
                status: 500,
            }
        );

    }
}
