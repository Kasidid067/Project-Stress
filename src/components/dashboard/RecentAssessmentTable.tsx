"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { LatestAssessment } from "@/types/adminDashboard";
import DashboardSection from "./DashboardSection";
import { stressLevelLabel } from "@/lib/displayLabels";

type AssessmentResponse = {
    assessments: LatestAssessment[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
};

function getPageItems(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const sortedPages = [...pages]
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

    return sortedPages.flatMap((page, index) =>
        index > 0 && page - sortedPages[index - 1] > 1
            ? ["…", page]
            : [page]
    );
}

export default function RecentAssessmentTable() {
    const [data, setData] = useState<AssessmentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        async function loadAssessments() {
            setLoading(true);

            try {
                const response = await fetch(
                    `/api/admin/dashboard/assessments?page=${page}`,
                    { cache: "no-store", signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดผลการประเมินได้");
                }

                setData(await response.json());
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    setData(null);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadAssessments();
        return () => controller.abort();
    }, [page]);

    const assessments = data?.assessments ?? [];
    const pagination = data?.pagination;
    const pages = pagination
        ? getPageItems(pagination.page, pagination.totalPages)
        : [];

    return (
        <DashboardSection title="ผลการประเมินล่าสุด">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--content-muted)]">
                            <th className="p-3 text-left">
                                รหัส
                            </th>
                            <th className="p-3 text-left">
                                ชื่อ
                            </th>
                            <th className="p-3">
                                คะแนน
                            </th>
                            <th className="p-3">
                                ระดับ
                            </th>
                            <th className="p-3">
                                วันที่
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-[var(--content-muted)]">
                                    กำลังโหลดผลการประเมิน...
                                </td>
                            </tr>
                        ) : assessments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-[var(--content-muted)]">
                                    ยังไม่มีผลการประเมิน
                                </td>
                            </tr>
                        ) : assessments.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"
                            >
                                <td className="p-3">
                                    {item.user.studentId}
                                </td>
                                <td className="p-3">
                                    {item.user.fullname}
                                </td>
                                <td className="text-center">
                                    {item.stressScore}%
                                </td>
                                <td className="text-center">
                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-medium
                                        ${
                                            item.stressLevel === "HIGH"
                                                ? "status-high"
                                                : item.stressLevel === "MEDIUM"
                                                    ? "status-medium"
                                                    : "status-low"
                                        }`}
                                    >
                                        {stressLevelLabel(item.stressLevel)}
                                    </span>
                                </td>
                                <td className="text-center">
                                    {new Date(
                                        item.createdAt
                                    ).toLocaleDateString("th-TH")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--content-muted)]">
                        แสดง {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} จากทั้งหมด {pagination.totalItems} รายการ
                    </p>

                    <nav className="flex items-center gap-1" aria-label="หน้าผลการประเมินล่าสุด">
                        <button
                            type="button"
                            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                            disabled={pagination.page === 1}
                            className="rounded-xl border border-[var(--border)] p-2 text-[var(--content-text)] transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="หน้าก่อนหน้า"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {pages.map((item, index) =>
                            typeof item === "string" ? (
                                <span key={`ellipsis-${index}`} className="px-1 text-sm text-[var(--content-muted)]">…</span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setPage(item)}
                                    aria-current={item === pagination.page ? "page" : undefined}
                                    className={`min-w-9 rounded-xl px-2 py-2 text-sm font-semibold transition ${item === pagination.page
                                        ? "bg-teal-600 text-white shadow-sm"
                                        : "border border-[var(--border)] text-[var(--content-text)] hover:border-teal-300 hover:text-teal-700"
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        )}

                        <button
                            type="button"
                            onClick={() => setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))}
                            disabled={pagination.page === pagination.totalPages}
                            className="rounded-xl border border-[var(--border)] p-2 text-[var(--content-text)] transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="หน้าถัดไป"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </nav>
                </div>
            )}
        </DashboardSection>
    );
}
