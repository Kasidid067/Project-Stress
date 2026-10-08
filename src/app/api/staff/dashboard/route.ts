import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
    Role,
    StressLevel,
} from "@prisma/client";

export async function GET() {
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

    const students =
        await prisma.user.findMany({
            where: {
                role: Role.STUDENT,
            },
            include: {
                major: true,
                results: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc",

                    },
                    include: {
                        pulse: true,
                    },
                },
            },
        });
    const advisors =
        await prisma.user.count({
            where: {
                role: Role.ADVISOR,
            },
        });
    const followUpLimit = new Date();
    followUpLimit.setDate(followUpLimit.getDate() - 30);
    let low = 0;
    let medium = 0;
    let high = 0;
    students.forEach(student => {
        const result =
            student.results[0];
        if (!result) return;
        switch (result.stressLevel) {
            case StressLevel.LOW:
                low++;
                break;
            case StressLevel.MEDIUM:
                medium++;
                break;
            case StressLevel.HIGH:
                high++;
                break;
        }
    });
    const studentSummaries = students.map((student) => {
        const latest = student.results[0] ?? null;
        return {
            id: student.id,
            fullname: student.fullname,
            studentId: student.studentId,
            phone: student.phone,
            major: student.major.name,
            latestScore: latest?.stressScore ?? null,
            latestLevel: latest?.stressLevel ?? null,
            assessedAt: latest?.createdAt ?? null,
        };
    });
    const highRiskStudents = studentSummaries
        .filter((student) => student.latestLevel === StressLevel.HIGH)
        .sort((left, right) => new Date(right.assessedAt ?? 0).getTime() - new Date(left.assessedAt ?? 0).getTime())
        .slice(0, 8);
    const overdueStudents = studentSummaries.filter(
        (student) => !student.assessedAt || new Date(student.assessedAt) < followUpLimit
    );
    const majorSummaryMap = new Map<string, { total: number; high: number }>();
    studentSummaries.forEach((student) => {
        const current = majorSummaryMap.get(student.major) ?? { total: 0, high: 0 };
        current.total++;
        if (student.latestLevel === StressLevel.HIGH) current.high++;
        majorSummaryMap.set(student.major, current);
    });
    const pendingSupportRequests = await prisma.studentSupportRequest.count({ where: { status: "PENDING" } });

    return NextResponse.json({
        totalStudents:
            students.length,
        totalAdvisors:
            advisors,
        low,
        medium,
        high,
        highRiskStudents,
        overdueStudents,
        pendingSupportRequests,
        majorSummaries: [...majorSummaryMap.entries()]
            .map(([major, summary]) => ({ major, ...summary }))
            .sort((left, right) => right.high - left.high || right.total - left.total),
    });
}
