"use client";

import ReportFilter from "@/components/reports/ReportFilter";
import ReportSummary from "@/components/reports/ReportSummary";
import ReportTable from "@/components/reports/ReportTable";
import ExportButtons from "@/components/reports/ExportButtons";

import { useReport } from "@/hooks/useReport";

export default function AdminReportsPage() {

  const {
    reports,
    loading,
    filter,
    setFilter,
  } = useReport();

  if (loading) {
    return (
      <div className="p-6">
        กำลังโหลด...
      </div>
    );
  }

  const total = reports.length;

  const low = reports.filter(
    report => report.stressLevel === "LOW"
  ).length;

  const medium = reports.filter(
    report => report.stressLevel === "MEDIUM"
  ).length;

  const high = reports.filter(
    report => report.stressLevel === "HIGH"
  ).length;

  return (
    <main className="admin-page wellness-page space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--content-text)]">
          รายงานผลการประเมินความเครียด
        </h1>

        <p className="mt-2 text-[var(--content-muted)]">

          ค้นหา กรอง และส่งออกรายงานผลการประเมิน
        </p>
      </div>

      {/* Filter */}
      <ReportFilter
        filter={filter}
        setFilter={setFilter}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <ReportSummary
          title="ทั้งหมด"
          value={total}
        />

        <ReportSummary
          title="ระดับต่ำ"
          value={low}
        />

        <ReportSummary
          title="ระดับปานกลาง"
          value={medium}
        />

        <ReportSummary
          title="ระดับสูง"
          value={high}
        />
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <ExportButtons
          reports={reports}
        />
      </div>

      {/* Table */}
      <ReportTable
        reports={reports}
      />
    </main>
  );
}
