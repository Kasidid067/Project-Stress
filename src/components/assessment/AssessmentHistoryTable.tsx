"use client";

import {
    Eye,
    HeartPulse,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { stressLevelLabel } from "@/lib/displayLabels";
import TablePagination from "@/components/common/TablePagination";

interface Props {
    history: any[];
    onView: (item: any) => void;
}

export default function AssessmentHistoryTable({
    history,
    onView,
}: Props) {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleHistory = useMemo(
        () => history.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, history]
    );

    useEffect(() => {
        setPage(1);
    }, [history]);

    if (history.length === 0) {
        return (
            <div className="wellness-card p-10 text-center">
                <p className="text-[var(--content-muted)]">
                    ยังไม่มีประวัติการประเมิน
                </p>
            </div>
        );
    }

    return (
        <div className="wellness-card overflow-hidden p-0">

            <div className="overflow-x-auto">
            <table className="w-full">

                <thead className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">

                    <tr>

                        <th className="p-4 text-left">
                            วันที่
                        </th>

                        <th className="text-center">
                            คะแนน
                        </th>

                        <th className="text-center">
                            ระดับ
                        </th>

                        <th className="text-center">
                            ชีพจร
                        </th>

                        <th className="text-center">
                            รายละเอียด
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {visibleHistory.map((item) => (

                        <tr
                            key={item.id}
                            className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                        >

                            <td className="p-4">

                                {new Date(
                                    item.createdAt
                                ).toLocaleString(
                                    "th-TH"
                                )}

                            </td>

                            <td className="text-center font-bold">

                                {item.stressScore}%

                            </td>

                            <td className="text-center">

                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-semibold

${item.stressLevel === "LOW"
                                            ? "status-low"
                                            : item.stressLevel === "MEDIUM"
                                                ? "status-medium"
                                                : "status-high"
                                        }

`}
                                >

                                    {stressLevelLabel(item.stressLevel)}

                                </span>

                            </td>

                            <td className="text-center">

                                {item.pulse?.bpm ?? "-"}

                            </td>

                            <td className="text-center">

                                <button

                                    onClick={() =>
                                        onView(item)
                                    }

                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-white shadow-sm hover:bg-teal-700"

                                >

                                    <Eye size={18} />

                                    ดูผล

                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>
            </div>

            <div className="px-5 pb-5">
                <TablePagination
                    page={currentPage}
                    totalItems={history.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />
            </div>

        </div>
    );
}
