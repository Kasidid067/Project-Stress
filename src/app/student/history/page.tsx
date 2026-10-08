"use client";

import { useActivityLog } from "@/hooks/useActivityLog";
import { activityCategoryLabel, stressLevelLabel } from "@/lib/displayLabels";

export default function StudentHistoryPage() {

    const {
        logs,
        loading,
    } = useActivityLog();

    if (loading) {
        return (
            <main className="flex h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-5xl">
                        ⏳
                    </div>
                    <p>
                        กำลังโหลดประวัติ...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="wellness-page mx-auto max-w-6xl p-5 sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-teal-800 dark:text-teal-200">
                    ประวัติการทำกิจกรรม
                </h1>
                <p className="mt-2 text-[var(--content-muted)]">
                    รายการกิจกรรมที่ทำเสร็จแล้ว
                </p>
            </div>
            {logs.length === 0 && (
                <div className="wellness-card p-10 text-center">
                    <div className="text-6xl">
                        📋
                    </div>
                    <h2 className="mt-4 text-2xl font-bold">
                        ยังไม่มีประวัติ
                    </h2>
                    <p className="mt-2 text-[var(--content-muted)]">
                        เมื่อทำกิจกรรมแล้วจะปรากฏที่หน้านี้
                    </p>
                </div>
            )}

            {logs.length > 0 && (
                <div className="wellness-card overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
                            <tr>
                                <th className="p-4 text-left">
                                    กิจกรรม
                                </th>
                                <th className="p-4">
                                    ประเภท
                                </th>
                                <th className="p-4">
                                    ระดับความเครียด
                                </th>
                                <th className="p-4">
                                    วันที่ทำ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="border-b"
                                >
                                    <td className="p-4">
                                        {log.activity.title}
                                    </td>
                                    <td className="p-4 text-center">
                                        {activityCategoryLabel(log.activity.category)}
                                    </td>
                                    <td className="p-4 text-center">
                                        {stressLevelLabel(log.activity.stressLevel)}
                                    </td>
                                    <td className="p-4 text-center">
                                        {log.completedAt
                                            ? new Date(
                                                log.completedAt
                                            ).toLocaleDateString(
                                                "th-TH"
                                            )
                                            : "-"
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
