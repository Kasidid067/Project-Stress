import { prisma } from "@/lib/prisma";
import { Role, StressLevel } from "@prisma/client";

export async function getAdminDashboardData() {

    const [
        totalUsers,
        totalStudents,
        totalAdvisors,
        totalStaff,
        totalAdmins,
        totalMajors,
        totalActivities,
        totalAssessments,
        lowStress,
        mediumStress,
        highStress,
        highStressStudents,
        monthlyAssessments,
        recommendedActivities,

    ] = await Promise.all([

        prisma.user.count(),
        prisma.user.count({
            where: {
                role: Role.STUDENT,
            },
        }),

        prisma.user.count({
            where: {
                role: Role.ADVISOR,
            },
        }),

        prisma.user.count({
            where: {
                role: Role.STAFF,
            },
        }),

        prisma.user.count({
            where: {
                role: Role.ADMIN,
            },
        }),

        prisma.major.count(),
        prisma.activity.count(),
        prisma.sT5Assessment.count(),
        prisma.stressResult.count({
            where: {
                stressLevel: StressLevel.LOW,
            },
        }),

        prisma.stressResult.count({
            where: {
                stressLevel: StressLevel.MEDIUM,
            },
        }),

        prisma.stressResult.count({
            where: {
                stressLevel: StressLevel.HIGH,
            },
        }),

        prisma.stressResult.findMany({
            where: {
                stressLevel: StressLevel.HIGH,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,

            include: {
                user: {
                    select: {
                        studentId: true,
                        fullname: true,
                        phone: true,
                    },
                },
            },
        }),


        prisma.$queryRaw<
            {
                month: number;
                total: bigint;
            }[]
        >`
        SELECT
            MONTH(createdAt) AS month,
            COUNT(*) AS total
        FROM ST5Assessment
        GROUP BY MONTH(createdAt)
        ORDER BY MONTH(createdAt)
        `,

        prisma.activity.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);

    return {

        totalUsers,
        totalStudents,
        totalAdvisors,
        totalStaff,
        totalAdmins,

        totalMajors,
        totalActivities,
        totalAssessments,

        lowStress,
        mediumStress,
        highStress,

        highStressStudents,

        monthlyAssessments:
            monthlyAssessments.map(item => ({
                // MySQL may return aggregate/date-expression values as BigInt.
                // Convert every numeric field before returning JSON from the API.
                month: Number(item.month),
                total: Number(item.total),
            })),
        
        recommendedActivities,
    };
}
