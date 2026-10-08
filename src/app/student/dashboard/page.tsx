"use client";

import { ClipboardCheck, Sparkles } from "lucide-react";
import LatestStressCard from "@/components/student/LatestStressCard";
import QuickAction from "@/components/student/QuickAction";
import RecommendedActivities from "@/components/student/RecommendedActivities";
import StressHistoryChart from "@/components/student/StressHistoryChart";
import WelcomeCard from "@/components/student/WelcomeCard";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";

export default function StudentDashboardPage() {
  const { dashboard, loading } = useStudentDashboard();

  if (loading) {
    return <div className="flex h-[75vh] items-center justify-center"><div className="text-center"><div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500" /><p className="text-[var(--content-muted)]">กำลังเตรียมพื้นที่ดูแลใจของคุณ...</p></div></div>;
  }

  if (!dashboard) {
    return <div className="wellness-card m-8 p-10 text-center">ไม่พบข้อมูลแดชบอร์ด</div>;
  }

  return (
    <main className="wellness-page mx-auto max-w-7xl space-y-6 p-5 sm:space-y-8 sm:p-8">
      <WelcomeCard fullname={dashboard.fullname} />

      <section className="grid gap-5 lg:grid-cols-3">
        <LatestStressCard latest={dashboard.latestResult} />
        <QuickAction />
        <div className="wellness-card p-6">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-950/45 dark:text-violet-300"><ClipboardCheck size={22} /></div><div><h2 className="font-bold">ภาพรวมของคุณ</h2><p className="text-sm text-[var(--content-muted)]">ติดตามได้อย่างค่อยเป็นค่อยไป</p></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-teal-50 p-4 dark:bg-teal-950/35"><p className="text-sm text-teal-700 dark:text-teal-200">ประเมินแล้ว</p><p className="mt-1 text-3xl font-bold text-teal-800 dark:text-teal-100">{dashboard.history.length}</p><p className="text-xs text-teal-700/80 dark:text-teal-200/75">ครั้ง</p></div>
            <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/25"><p className="text-sm text-amber-700 dark:text-amber-200">กิจกรรม</p><p className="mt-1 text-3xl font-bold text-amber-800 dark:text-amber-100">{dashboard.activities.length}</p><p className="text-xs text-amber-700/80 dark:text-amber-200/75">รายการแนะนำ</p></div>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-[var(--content-muted)]"><Sparkles size={16} className="text-amber-500" /> ทุกก้าวเล็ก ๆ คือการดูแลตัวเอง</p>
        </div>
      </section>

      <StressHistoryChart history={dashboard.history} />
      <RecommendedActivities activities={dashboard.activities} />
    </main>
  );
}
