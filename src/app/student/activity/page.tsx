"use client";

import { useState } from "react";
import { Clock3, Heart, Sparkles } from "lucide-react";
import ActivityFeedbackDialog from "@/components/activity/ActivityFeedbackDialog";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useStudentActivities } from "@/hooks/useStudentActivities";
import { completeActivity } from "@/services/activityLog.service";
import type { Activity } from "@/types/activity";
import { activityCategoryLabel, stressLevelLabel } from "@/lib/displayLabels";
import ReferenceLinks from "@/components/common/ReferenceLinks";

export default function ActivityPage() {
  const { activities, loading, refresh } = useStudentActivities();
  const { logs, refresh: refreshLogs } = useActivityLog();
  const completedIds = logs.map((log) => log.activityId);
  const completedToday = logs.filter((log) => {
    if (!log.completed || !log.completedAt) return false;

    const completedAt = new Date(log.completedAt);
    const today = new Date();
    return completedAt.getFullYear() === today.getFullYear()
      && completedAt.getMonth() === today.getMonth()
      && completedAt.getDate() === today.getDate();
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [feedbackActivity, setFeedbackActivity] = useState<Activity | null>(null);

  function handleComplete(activity: Activity) {
    if (!completedIds.includes(activity.id)) setFeedbackActivity(activity);
  }

  async function handleFeedbackSubmit(mood: "BETTER" | "SAME" | "WORSE", note: string) {
    if (!feedbackActivity) return;
    try {
      setSavingId(feedbackActivity.id);
      await completeActivity(feedbackActivity.id, mood, note);
      await Promise.all([refreshLogs(), refresh()]);
      setFeedbackActivity(null);
      alert("บันทึกกิจกรรมและความรู้สึกเรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถบันทึกกิจกรรมได้");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <main className="flex h-[70vh] items-center justify-center"><p>กำลังโหลดกิจกรรม...</p></main>;

  return (
    <main className="wellness-page mx-auto max-w-6xl p-5 sm:p-8">
      <section className="wellness-hero mb-8 p-6 sm:p-8">
        <div className="relative z-10 max-w-xl"><div className="wellness-badge w-fit bg-white/70 text-teal-700 shadow-sm"><Sparkles size={14} /> พื้นที่เล็ก ๆ เพื่อดูแลใจตัวเอง</div><h1 className="mt-4 text-3xl font-bold text-teal-950 sm:text-4xl dark:text-teal-50">กิจกรรมแนะนำ</h1><p className="mt-3 leading-7 text-teal-900/75 dark:text-teal-100/75">เลือกทำกิจกรรมที่เหมาะกับคุณ แล้วบอกเราได้ว่าหลังจากนั้นรู้สึกอย่างไรบ้าง</p></div>
        <Heart fill="currentColor" className="absolute bottom-6 right-7 hidden text-rose-400 sm:block" size={36} />
      </section>

      {completedToday.length > 0 && <section className="wellness-card mb-8 p-6">
        <h2 className="text-xl font-bold">✅ ทำแล้ววันนี้</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {completedToday.map((log) => <div key={log.id} className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <p className="font-semibold">{log.activity.title}</p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">ทำเมื่อ {new Date(log.completedAt!).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.</p>
          </div>)}
        </div>
      </section>}

      {activities.length === 0 && <div className="wellness-card p-10 text-center"><div className="text-6xl">📋</div><h2 className="mt-4 text-2xl font-bold">ยังไม่มีกิจกรรม</h2><p className="mt-2 text-[var(--content-muted)]">กรุณาติดต่อผู้ดูแลระบบ</p></div>}

      <div className="grid gap-6 md:grid-cols-2">{activities.map((activity) => {
        const completed = completedIds.includes(activity.id);
        const saving = savingId === activity.id;
        return <article key={activity.id} className="wellness-card p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{activity.title}</h2><span className="wellness-badge shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{stressLevelLabel(activity.stressLevel)}</span></div><p className="mt-4 text-[var(--content-muted)]">{activity.description}</p>{activity.recommendationReasons && activity.recommendationReasons.length > 0 && <p className="mt-4 rounded-xl bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 dark:bg-teal-950/35 dark:text-teal-100">แนะนำเพราะ: {activity.recommendationReasons.join(" · ")}</p>}<div className="mt-5 flex items-center gap-3 text-sm text-[var(--content-muted)]"><span className="rounded-xl bg-teal-50 px-3 py-2 font-medium text-teal-700 dark:bg-teal-950/35 dark:text-teal-200">{activityCategoryLabel(activity.category)}</span><span className="flex items-center gap-1.5"><Clock3 size={16} /> {activity.duration} นาที</span></div><button disabled={completed || saving} onClick={() => handleComplete(activity)} className={`mt-6 w-full rounded-2xl py-3 font-semibold text-white shadow-sm transition ${completed ? "bg-slate-400" : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:-translate-y-0.5 hover:shadow-lg"}`}>{saving ? "กำลังบันทึก..." : completed ? "✅ ทำกิจกรรมแล้ว" : "ทำกิจกรรมเสร็จแล้ว"}</button></article>;
      })}</div>
      <div className="mt-8"><ReferenceLinks references={[{ title: "World Health Organization (2020): Doing What Matters in Times of Stress", description: "คู่มือแนวทางดูแลความเครียดด้วยตนเองขององค์การอนามัยโลก", href: "https://www.who.int/publications/b/53604" }]} /></div>
      {feedbackActivity && <ActivityFeedbackDialog activityTitle={feedbackActivity.title} saving={savingId === feedbackActivity.id} onClose={() => setFeedbackActivity(null)} onSubmit={handleFeedbackSubmit} />}
    </main>
  );
}
