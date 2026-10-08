"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Brain, HeartPulse, User } from "lucide-react";
import TablePagination from "@/components/common/TablePagination";
import StudentStressTrendChart from "@/components/advisor/StudentStressTrendChart";
import RiskFollowUpPanel from "@/components/risk/RiskFollowUpPanel";
import ST5AnswerList from "@/components/assessment/ST5AnswerList";
import { useAdvisorStudentDetail } from "@/hooks/useAdvisorStudentDetail";

const PAGE_SIZE = 10;

function StressLevelBadge({ level }: { level?: string }) {
  if (level === "HIGH") return <span className="status-high inline-block rounded-full px-3 py-1 text-sm font-semibold">สูง</span>;
  if (level === "MEDIUM") return <span className="status-medium inline-block rounded-full px-3 py-1 text-sm font-semibold">ปานกลาง</span>;
  if (level === "LOW") return <span className="status-low inline-block rounded-full px-3 py-1 text-sm font-semibold">ต่ำ</span>;
  return <span className="text-[var(--content-muted)]">-</span>;
}

function slicePage<T>(items: T[], page: number) {
  return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

export default function AdvisorStudentDetailPage() {
  const params = useParams();
  const { student, loading } = useAdvisorStudentDetail(Number(params.id));
  const [resultPage, setResultPage] = useState(1);
  const [pulsePage, setPulsePage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  const results = student?.results ?? [];
  const pulses = student?.pulses ?? [];
  const activityLogs = student?.activityLogs ?? [];

  useEffect(() => {
    setResultPage((page) => Math.min(page, Math.max(1, Math.ceil(results.length / PAGE_SIZE))));
    setPulsePage((page) => Math.min(page, Math.max(1, Math.ceil(pulses.length / PAGE_SIZE))));
    setActivityPage((page) => Math.min(page, Math.max(1, Math.ceil(activityLogs.length / PAGE_SIZE))));
  }, [results.length, pulses.length, activityLogs.length]);

  if (loading) return <main className="flex h-[70vh] items-center justify-center">กำลังโหลดข้อมูล...</main>;
  if (!student) return <main className="flex h-[70vh] items-center justify-center">ไม่พบข้อมูลนิสิต</main>;

  const latest = results[0];
  const visibleResults = slicePage(results, resultPage);
  const visiblePulses = slicePage(pulses, pulsePage);
  const visibleActivities = slicePage(activityLogs, activityPage);

  return (
    <main className="advisor-page space-y-7 p-2 sm:p-4">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="w-fit rounded-full bg-[var(--surface-muted)] p-5"><User size={42} className="text-[var(--accent-strong)]" /></div>
          <div><h1 className="text-3xl font-bold">{student.fullname}</h1><p className="mt-2 text-[var(--content-muted)]">รหัสนิสิต {student.studentId}</p><p className="text-[var(--content-muted)]">{student.major.name}</p></div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}><p className="text-[var(--content-muted)]">คะแนนล่าสุด</p><p className="mt-3 text-4xl font-bold">{latest?.stressScore ?? "-"}{latest ? "%" : ""}</p></div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}><p className="flex items-center gap-2 text-[var(--content-muted)]"><HeartPulse size={19} /> ชีพจรล่าสุด</p><p className="mt-3 text-4xl font-bold">{latest?.pulse?.bpm ?? pulses[0]?.bpm ?? "-"}</p><p className="mt-1 text-sm text-[var(--content-muted)]">BPM</p></div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}><p className="text-[var(--content-muted)]">ระดับล่าสุด</p><div className="mt-4"><StressLevelBadge level={latest?.stressLevel} /></div></div>
      </section>

      <StudentStressTrendChart history={results} />

      <RiskFollowUpPanel studentId={student.id} />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
        <h2 className="mb-4 flex items-center gap-3 text-xl font-bold"><Brain /> สรุปผล</h2><p className="leading-7 text-[var(--content)]">{latest?.aiSummary ?? "ยังไม่มีสรุปผลการประเมิน"}</p>
        <h3 className="mb-2 mt-6 text-lg font-bold">คำแนะนำ</h3><p className="leading-7 text-[var(--content)]">{latest?.recommendation ?? "ยังไม่มีคำแนะนำ"}</p>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
        <h2 className="mb-6 text-xl font-bold">ประวัติการประเมิน ST-5</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[620px]"><thead><tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--content-muted)]"><th className="p-4 text-left">วันที่</th><th>คะแนน</th><th>ระดับ</th><th>ชีพจร</th></tr></thead><tbody>{visibleResults.length ? visibleResults.map((item: any) => <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"><td className="p-4">{new Date(item.createdAt).toLocaleString("th-TH")}</td><td className="text-center">{item.stressScore}%</td><td className="text-center"><StressLevelBadge level={item.stressLevel} /></td><td className="text-center">{item.pulse?.bpm ?? "-"}</td></tr>) : <tr><td colSpan={4} className="p-8 text-center text-[var(--content-muted)]">ยังไม่มีประวัติการประเมิน</td></tr>}</tbody></table></div>
        <TablePagination page={resultPage} totalItems={results.length} pageSize={PAGE_SIZE} onPageChange={setResultPage} />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
        <h2 className="mb-6 flex items-center gap-3 text-xl font-bold"><HeartPulse /> ประวัติการวัดชีพจร</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[500px]"><thead><tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--content-muted)]"><th className="p-4 text-left">วันที่</th><th>ชีพจร</th><th>สถานะ</th></tr></thead><tbody>{visiblePulses.length ? visiblePulses.map((item: any) => { const status = item.bpm < 60 ? "ชีพจรต่ำ" : item.bpm <= 100 ? "ปกติ" : item.bpm <= 120 ? "ค่อนข้างสูง" : "สูงผิดปกติ"; return <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"><td className="p-4">{new Date(item.recordedAt).toLocaleString("th-TH")}</td><td className="text-center font-semibold">{item.bpm} BPM</td><td className="text-center">{status}</td></tr>; }) : <tr><td colSpan={3} className="p-8 text-center text-[var(--content-muted)]">ยังไม่มีประวัติการวัดชีพจร</td></tr>}</tbody></table></div>
        <TablePagination page={pulsePage} totalItems={pulses.length} pageSize={PAGE_SIZE} onPageChange={setPulsePage} />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
        <h2 className="mb-6 flex items-center gap-3 text-xl font-bold"><Activity /> ประวัติการทำกิจกรรม</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px]"><thead><tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--content-muted)]"><th className="p-4 text-left">วันที่</th><th>กิจกรรม</th><th>ระยะเวลา</th><th>สถานะ</th></tr></thead><tbody>{visibleActivities.length ? visibleActivities.map((log: any) => <tr key={log.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]"><td className="p-4">{new Date(log.createdAt).toLocaleString("th-TH")}</td><td>{log.activity.title}</td><td className="text-center">{log.activity.duration} นาที</td><td className="text-center">{log.completed ? <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">สำเร็จ</span> : <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">ยังไม่เสร็จ</span>}</td></tr>) : <tr><td colSpan={4} className="p-8 text-center text-[var(--content-muted)]">ยังไม่มีประวัติการทำกิจกรรม</td></tr>}</tbody></table></div>
        <TablePagination page={activityPage} totalItems={activityLogs.length} pageSize={PAGE_SIZE} onPageChange={setActivityPage} />
      </section>

      {latest?.assessment && <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}><h2 className="mb-2 text-xl font-bold">คำถามและคำตอบ ST-5 ล่าสุด</h2><ST5AnswerList answers={latest.assessment.answers} /></section>}
    </main>
  );
}
