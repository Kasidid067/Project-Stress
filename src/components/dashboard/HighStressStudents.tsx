import Link from "next/link";
import { Phone, View } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { stressLevelLabel } from "@/lib/displayLabels";

import type {
    HighStressStudent,
} from "@/types/adminDashboard";

interface Props {

    students: HighStressStudent[];

}

export default function HighStressStudents({
    students,
}: Props) {
    return (
        <DashboardSection
            title="🚨 นิสิตที่มีความเครียดสูง"
        >
            <div className="space-y-4">
                {students.map(student => (
                    <div
                        key={student.id}
                        className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 dark:border-rose-900/35 dark:bg-rose-950/20"
                    >

                        <h3 className="font-semibold text-[var(--content-text)]">
                            {student.user.studentId}
                        </h3>

                        <p className="text-[var(--content-muted)]">
                            {student.user.fullname}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--content-muted)]">
                            <Phone size={15} className="text-rose-500" />
                            {student.user.phone || "ยังไม่ได้ระบุเบอร์โทร"}
                        </p>

                        <div className="mt-2 flex justify-between">
                            <span className="text-[var(--content-text)]">
                                คะแนน
                                {" "}
                                {student.stressScore}%
                            </span>
                            <span
                                className="status-high rounded-full px-3 py-1 text-sm font-medium"
                            >
                                {stressLevelLabel(student.stressLevel)}
                            </span>
                        </div>

                        <Link
                            href={`/admin/assessments/${student.id}`}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
                        >
                            <View size={16} />
                            ดูผลการประเมิน
                        </Link>
                    </div>
                ))}
            </div>
        </DashboardSection>
    );
}
