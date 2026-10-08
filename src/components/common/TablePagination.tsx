"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type TablePaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

function getPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((left, right) => left - right);

  return sorted.flatMap((item, index) =>
    index > 0 && item - sorted[index - 1] > 1 ? ["…", item] : [item]
  );
}

export default function TablePagination({
  page,
  totalItems,
  pageSize = 10,
  onPageChange,
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return totalItems > 0 ? (
      <p className="mt-5 text-sm text-[var(--content-muted)]">
        แสดง 1-{totalItems} จากทั้งหมด {totalItems} รายการ
      </p>
    ) : null;
  }

  const currentPage = Math.min(page, totalPages);
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageItems(currentPage, totalPages);

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--content-muted)]">
        แสดง {firstItem}-{lastItem} จากทั้งหมด {totalItems} รายการ
      </p>

      <nav className="flex items-center gap-1" aria-label="เปลี่ยนหน้าตารางรายงาน">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
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
              onClick={() => onPageChange(item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={`min-w-9 rounded-xl px-2 py-2 text-sm font-semibold transition ${item === currentPage
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-xl border border-[var(--border)] p-2 text-[var(--content-text)] transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="หน้าถัดไป"
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  );
}
