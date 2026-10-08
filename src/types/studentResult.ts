import type {
    Activity,
    StressLevel,
} from "@prisma/client";

export interface StudentResult {
    result: {
        id: number;
        stressScore: number;
        stressLevel: StressLevel;
        recommendation: string | null;
        aiSummary: string | null;
        createdAt: string;
        user: {
            fullname: string;
            studentId: string;
            major: {
                id: number;
                name: string;
            };
        };
    };
    activities: (Activity & { recommendationReasons?: string[] })[];
}
