import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    addActivityRecommendationReasons,
    recommendActivitiesFromST5,
} from "@/lib/st5ActivityRecommendation";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

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

    const user =
        await prisma.user.findUnique({
            where: {
                id: Number(session.user.id),
            },

            include: {
                results: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    include: {
                        assessment: {
                            include: {
                                answers: true,
                            },
                        },
                    },
                },
            },
        });

    if (!user) {
        return NextResponse.json(
            {
                message: "ไม่พบผู้ใช้",
            },
            {
                status: 404,
            }
        );
    }

    const latestResult =
        user.results[0] ?? null;

    const history =
        await prisma.stressResult.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "asc",
            },
            select: {
                stressScore: true,
                createdAt: true,
            },
        });

    const activities = latestResult
        ? await prisma.activity.findMany({ orderBy: { title: "asc" } })
        : [];
    const levelActivities = latestResult
        ? activities.filter((activity) => activity.stressLevel === latestResult.stressLevel)
        : [];
    const recommendedActivities = latestResult
        ? recommendActivitiesFromST5(
            activities,
            latestResult.assessment.answers,
            levelActivities
        )
        : [];
    const annotatedActivities = latestResult
        ? addActivityRecommendationReasons(
            recommendedActivities,
            latestResult.assessment.answers
        )
        : [];
    return NextResponse.json({
        fullname: user.fullname,

        latestResult: latestResult
            ? {
                stressScore: latestResult.stressScore,
                stressLevel: latestResult.stressLevel,
                createdAt: latestResult.createdAt,
            }
            : null,

        history: history.map((item) => ({
            score: item.stressScore,
            createdAt: item.createdAt,
        })),

        activities: annotatedActivities.map((activity) => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            duration: activity.duration,
            category: activity.category,
            image: activity.image,
            recommendationReasons: activity.recommendationReasons,
        })),
    });
}
