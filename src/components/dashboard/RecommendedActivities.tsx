import DashboardSection from "./DashboardSection";
import { activityCategoryLabel } from "@/lib/displayLabels";

import type {
    RecommendedActivity,
} from "@/types/adminDashboard";

interface Props {
    activities?: RecommendedActivity[];
}

export default function RecommendedActivities({
    activities = [],
}: Props) {
    console.log("Activities :", activities);
    return (

        <DashboardSection
            title="⭐ กิจกรรมแนะนำ"
        >

            <div className="space-y-4">
                {activities.map(activity => (
                    <div
                        key={activity.id}
                        className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4 dark:border-teal-900/35 dark:bg-teal-950/20"
                    >

                        <h3 className="font-semibold text-[var(--content-text)]">

                            {activity.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--content-muted)]">
                            {activity.description}
                        </p>

                        <div
                            className="mt-2 flex justify-between text-sm text-[var(--content-muted)]"
                        >

                            <span>
                                {activityCategoryLabel(activity.category)}
                            </span>

                            <span>
                                {activity.duration} นาที
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardSection>
    );
}
