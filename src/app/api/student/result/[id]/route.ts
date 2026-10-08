import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    addActivityRecommendationReasons,
    recommendActivitiesFromST5,
} from "@/lib/st5ActivityRecommendation";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

interface Context {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    req: Request,
    { params }: Context
) {
    try {

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

        const { id } = await params;

        const result =
            await prisma.stressResult.findFirst({

                where: {

                    assessmentId: Number(id),

                    userId: Number(session.user.id),

                },

                include: {

                    assessment: {
                        include: {
                            answers: true,
                        },
                    },

                    user: {

                        include: {

                            major: true,

                        },

                    },

                },

            });

        if (!result) {

            return NextResponse.json(
                {
                    message: "ไม่พบผลการประเมิน",
                },
                {
                    status: 404,
                }
            );

        }

        const activities =
            await prisma.activity.findMany({
                orderBy: {

                    title: "asc",

                },

            });

        const recommendedActivities = recommendActivitiesFromST5(
            activities,
            result.assessment.answers,
            activities.filter((activity) => activity.stressLevel === result.stressLevel)
        );

        return NextResponse.json({

            result,

            activities: addActivityRecommendationReasons(
                recommendedActivities,
                result.assessment.answers
            ),

        });

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
