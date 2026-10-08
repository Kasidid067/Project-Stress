export interface ActivityLog {
    id: number;
    userId: number;
    activityId: number;
    completed: boolean;
    completedAt: string | null;
    feedbackMood: "BETTER" | "SAME" | "WORSE" | null;
    feedbackNote: string | null;
    createdAt: string;
    activity: {
        id: number;
        title: string;
        description: string;
        duration: number;
        category: string;
        stressLevel: string;
        image: string | null;
    };
}
