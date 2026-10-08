"use client";

import { useEffect, useMemo, useState } from "react";
import type { Report } from "@/types/report";
import { stressLevelLabel } from "@/lib/displayLabels";
import TablePagination from "@/components/common/TablePagination";

interface Props {
    reports: Report[];
}

export default function ReportTable({
    reports,
}: Props) {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(reports.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleReports = useMemo(
        () => reports.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, reports]
    );

    useEffect(() => {
        setPage(1);
    }, [reports]);

    return (
        <div className="theme-card rounded-2xl p-6">
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="p-3">รหัส</th>
                        <th className="p-3">ชื่อ</th>
                        <th className="p-3">หลักสูตร</th>
                        <th className="p-3">คะแนน</th>
                        <th className="p-3">ระดับ</th>
                        <th className="p-3">วันที่</th>
                    </tr>
                </thead>

                <tbody>
                    {visibleReports.map(report => (
                        <tr
                            key={report.id}
                            className="border-b"
                        >
                            <td className="p-3">
                                {report.user.studentId}
                            </td>
                            <td className="p-3">
                                {report.user.fullname}
                            </td>
                            <td className="p-3">
                                {report.user.major.name}
                            </td>
                            <td className="p-3">
                                {report.stressScore}%
                            </td>
                            <td className="p-3">
                                {stressLevelLabel(report.stressLevel)}
                            </td>
                            <td className="p-3">
                                {new Date(
                                    report.createdAt
                                ).toLocaleDateString("th-TH")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <TablePagination
                page={currentPage}
                totalItems={reports.length}
                pageSize={pageSize}
                onPageChange={setPage}
            />
        </div>
    );
}
