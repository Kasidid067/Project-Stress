import axios from "axios";
import type { ActivityLog } from "@/types/activityLog";

const API = "/api/student/activity-log";

export async function completeActivity(
    activityId: number,
    feedbackMood: "BETTER" | "SAME" | "WORSE",
    feedbackNote?: string
) {
    const { data } =
        await axios.post<ActivityLog>(
            API,
            {
                activityId,
                feedbackMood,
                feedbackNote,
            }
        );
    return data;
}

export async function getActivityLogs() {
    const { data } =
        await axios.get<ActivityLog[]>(
            API
        );
    return data;
}
