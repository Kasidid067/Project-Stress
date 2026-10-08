import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    addActivityRecommendationReasons,
    recommendActivitiesFromST5,
} from "@/lib/st5ActivityRecommendation";
import { NextResponse } from "next/server";
import { Role, StressLevel } from "@prisma/client";

export async function GET() {

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

    const userId =
        Number(session.user.id);

    const latestResult =
        await prisma.stressResult.findFirst({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                assessment: {
                    include: {
                        answers: true,
                    },
                },
            },
        });

    // ยังไม่เคยประเมิน ST5
    if (!latestResult) {
        return NextResponse.json([]);
    }
    let levels: StressLevel[] = [];

    switch (
        latestResult.stressLevel
    ) {
        case StressLevel.LOW:
            levels = [
                StressLevel.LOW,
            ];
            break;
        case StressLevel.MEDIUM:
            levels = [
                StressLevel.MEDIUM,
                StressLevel.LOW,
            ];
            break;
        case StressLevel.HIGH:
            levels = [
                StressLevel.HIGH,
            ];
            break;
    }

    const activities = await prisma.activity.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
    const levelActivities = activities.filter((activity) => levels.includes(activity.stressLevel));
    const recommendedActivities = recommendActivitiesFromST5(
            activities,
            latestResult.assessment.answers,
            levelActivities
    );
    return NextResponse.json(
        addActivityRecommendationReasons(
            recommendedActivities,
            latestResult.assessment.answers
        )
    );
}
