"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, FileSpreadsheet, FileText } from "lucide-react";
import { useStaffReports } from "@/hooks/useStaffReports";
import { exportReportsToExcel } from "@/utils/exportExcel";
import { exportReportsToPDF } from "@/utils/exportPdf";
import type { Report } from "@/types/report";
import TablePagination from "@/components/common/TablePagination";

function toExportReports(students: any[]): Report[] {
    return students.flatMap((student) => {
        const result = student.results?.[0];

        if (!result) return [];

        return [{
            id: result.id,
            createdAt: result.createdAt,
            stressScore: result.stressScore,
            stressLevel: result.stressLevel,
            user: {
                studentId: student.studentId,
                fullname: student.fullname,
                major: { name: student.major.name },
            },
        }];
    });
}

type Major = {
    id: number;
    name: string;
};

export default function StaffReportsPage() {

    const {
        reports,
        loading,
    } = useStaffReports();

    const [
        keyword,
        setKeyword,
    ] = useState("");

    const [
        major,
        setMajor,
    ] = useState("");

    const [majors, setMajors] = useState<Major[]>([]);

    const [stressLevel, setStressLevel] = useState("ALL");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetch("/api/admin/majors", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : [])
            .then((data) => setMajors(Array.isArray(data) ? data : []))
            .catch(() => setMajors([]));
    }, []);

    const filtered =
        useMemo(() => {

            return reports.filter(
                (student: any) => {

                    const matchKeyword =

                        student.fullname
                            .toLowerCase()
                            .includes(
                                keyword.toLowerCase()
                            )

                        ||

                        student.studentId
                            .toLowerCase()
                            .includes(
                                keyword.toLowerCase()
                            );

                    const matchMajor =

                        major === ""

                        ||

                        student.major.name === major;

                    const matchStressLevel =
                        stressLevel === "ALL"
                        || student.results?.[0]?.stressLevel === stressLevel;

                    return (

                        matchKeyword &&

                        matchMajor &&

                        matchStressLevel

                    );

                }

            );

        }, [

            reports,

            keyword,

            major,

            stressLevel,

        ]);

    if (loading) {

        return (

            <main className="p-8">

                กำลังโหลด...

            </main>

        );

    }

    const exportableReports = toExportReports(filtered);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleStudents = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (

        <main className="staff-page space-y-8 p-2 sm:p-4">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-4xl font-bold text-[var(--accent-strong)]">

                        รายงานทั้งหมด

                    </h1>

                    <p className="mt-2 text-[var(--content-muted)]">

                        รายงานภาพรวมของนิสิตทั้งมหาวิทยาลัย

                    </p>

                </div>

                <div className="flex gap-3">

                    <button
                        onClick={() => exportReportsToExcel(exportableReports)}
                        disabled={exportableReports.length === 0}

                        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"

                    >

                        <FileSpreadsheet size={18} />

                        Export Excel

                    </button>

                    <button
                        onClick={() => exportReportsToPDF(exportableReports)}
                        disabled={exportableReports.length === 0}

                        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-semibold text-[var(--content-text)] transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"

                    >

                        <FileText size={18} />

                        Export PDF

                    </button>

                </div>

            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}>

                <div className="mb-6 grid gap-4 md:grid-cols-3">

                    <div className="relative">

                        <Search
                            size={18}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--content-muted)]"
                        />

                        <input

                            value={keyword}

                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setPage(1);
                            }}

                            placeholder="ค้นหา"

                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-3 pl-11 text-[var(--content-text)] placeholder:text-[var(--content-muted)] focus:border-[var(--accent)] focus:outline-none"

                        />

                    </div>

                    <select

                        value={major}

                            onChange={(e) => {
                                setMajor(e.target.value);
                                setPage(1);
                            }}

                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)] focus:border-[var(--accent)] focus:outline-none"

                    >

                        <option value="">

                            ทุกหลักสูตร

                        </option>

                        {

                            majors.map(
                                (item) => (

                                    <option
                                        key={item.id}
                                        value={item.name}
                                    >

                                        {item.name}

                                    </option>

                                )
                            )

                        }

                    </select>

                    <select
                        value={stressLevel}
                        onChange={(e) => {
                            setStressLevel(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)] focus:border-[var(--accent)] focus:outline-none"
                    >
                        <option value="ALL">ทุกระดับความเครียด</option>
                        <option value="LOW">ความเครียดต่ำ</option>
                        <option value="MEDIUM">ความเครียดปานกลาง</option>
                        <option value="HIGH">ความเครียดสูง</option>
                    </select>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead className="bg-[var(--surface-muted)] text-[var(--content-muted)]">

                            <tr>

                                <th className="p-4 text-left">

                                    รหัส

                                </th>

                                <th className="p-4">

                                    ชื่อ

                                </th>

                                <th className="p-4">

                                    หลักสูตร

                                </th>

                                <th className="p-4">
                                    คะแนน
                                </th>
                                <th className="p-4">
                                    ระดับ
                                </th>
                                <th className="p-4">
                                    ชีพจร
                                </th>
                                <th className="p-4">
                                    อาจารย์
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={9}
                                        className="p-8 text-center text-[var(--content-muted)]"
                                    >

                                        ไม่พบข้อมูล

                                    </td>

                                </tr>

                            ) : (

                                visibleStudents.map(
                                    (student: any) => {

                                        const result =
                                            student.results?.[0];

                                        return (

                                            <tr
                                                key={student.id}
                                                className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                                            >

                                                <td className="p-4">

                                                    {student.studentId}

                                                </td>

                                                <td className="p-4">

                                                    {student.fullname}

                                                </td>

                                                <td className="p-4">

                                                    {student.major.name}

                                                </td>

                                                <td className="p-4 text-center font-bold">

                                                    {result?.stressScore ?? "-"}

                                                </td>

                                                <td className="p-4 text-center">

                                                    {result?.stressLevel ===
                                                        "LOW" ? (

                                                        <span className="status-low rounded-full px-3 py-1 text-sm font-semibold">

                                                            ต่ำ

                                                        </span>

                                                    ) : result?.stressLevel ===
                                                        "MEDIUM" ? (

                                                        <span className="status-medium rounded-full px-3 py-1 text-sm font-semibold">

                                                            ปานกลาง

                                                        </span>

                                                    ) : result?.stressLevel ===
                                                        "HIGH" ? (

                                                        <span className="status-high rounded-full px-3 py-1 text-sm font-semibold">

                                                            สูง

                                                        </span>

                                                    ) : (

                                                        "-"

                                                    )}

                                                </td>

                                                <td className="p-4 text-center">

                                                    {result?.pulse?.bpm ?? "-"}

                                                </td>

                                                <td className="p-4">

                                                    {student.advisor
                                                        ?.fullname ??
                                                        "-"}

                                                </td>

                                            </tr>

                                        );

                                    }

                                )

                            )}

                        </tbody>

                    </table>

                </div>

                <TablePagination
                    page={currentPage}
                    totalItems={filtered.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />

                <div className="mt-6 flex items-center justify-between">

                    <p className="text-sm text-[var(--content-muted)]">

                        ทั้งหมด {filtered.length} รายการ

                    </p>

                    <div className="flex gap-3">

                        <button
                            onClick={() => exportReportsToExcel(exportableReports)}
                            disabled={exportableReports.length === 0}
                            className="rounded-lg border border-[var(--border)] px-4 py-2 text-[var(--content-text)] transition hover:bg-[var(--surface-muted)]"
                        >

                            Export Excel

                        </button>

                        <button
                            onClick={() => exportReportsToPDF(exportableReports)}
                            disabled={exportableReports.length === 0}
                            className="rounded-lg border border-[var(--border)] px-4 py-2 text-[var(--content-text)] transition hover:bg-[var(--surface-muted)]"
                        >

                            Export PDF

                        </button>

                    </div>

                </div>

            </div>

        </main>

    );

}
