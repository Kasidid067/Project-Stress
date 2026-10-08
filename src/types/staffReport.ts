export interface StaffReportStudent {
    id: number;
    studentId: string;
    fullname: string;
    major: string;
    latestResult: {
        score: number;
        level: "LOW" | "MEDIUM" | "HIGH";
        createdAt: string;
        bpm: number | null;
        recommendation: string | null;
        aiSummary: string | null;
    } | null;
}

export interface StaffReport {
    total: number;
    assessed: number;
    notAssessed: number;
    low: number;
    medium: number;
    high: number;
    students: StaffReportStudent[];
}
