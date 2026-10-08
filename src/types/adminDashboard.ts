export interface LatestAssessment {

    id: number;

    stressScore: number;

    stressLevel: string;

    createdAt: string;

    user: {

        fullname: string;

        studentId: string;

    };

}

export interface MonthlyAssessment {
    month: number;
    total: number;
}

export interface AdminDashboard {
    totalUsers: number;
    totalStudents: number;
    totalAdvisors: number;
    totalStaff: number;
    totalAdmins: number;
    totalMajors: number;
    totalActivities: number;
    totalAssessments: number;
    lowStress: number;
    mediumStress: number;
    highStress: number;
    monthlyAssessments: MonthlyAssessment[];

    highStressStudents: HighStressStudent[];

    recommendedActivities: RecommendedActivity[];
}

export interface HighStressStudent {
    id: number;
    stressScore: number;
    stressLevel: string;
    createdAt: string;
    user: {
        studentId: string;
        fullname: string;
        phone: string | null;
    };
}

export interface RecommendedActivity {
    id: number;
    title: string;
    description: string;
    duration: number;
    category: string;
    stressLevel: string;
}
