import { CalendarDays, HeartPulse, Sparkles } from "lucide-react";
import { STRESS_CONFIG, StressLevelType } from "@/types/stress";

interface Props { latest: { stressScore: number; stressLevel: string; createdAt: string } | null; }

export default function LatestStressCard({ latest }: Props) {
  if (!latest) {
    return <div className="wellness-card flex min-h-[260px] flex-col justify-between p-6"><div className="flex items-center gap-3"><div className="rounded-2xl bg-teal-100 p-3 text-teal-600 dark:bg-teal-950/45 dark:text-teal-300"><HeartPulse size={22} /></div><div><h2 className="font-bold">เช็กอินล่าสุด</h2><p className="text-sm text-[var(--content-muted)]">ยังไม่มีผลประเมิน</p></div></div><div className="py-5 text-center"><div className="text-5xl">🌱</div><p className="mt-3 text-sm text-[var(--content-muted)]">เริ่มประเมินเมื่อพร้อม เพื่อรู้จักใจตัวเองมากขึ้น</p></div></div>;
  }

  const config = STRESS_CONFIG[latest.stressLevel as StressLevelType];
  return (
    <div className="wellness-card p-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-2xl bg-teal-100 p-3 text-teal-600 dark:bg-teal-950/45 dark:text-teal-300"><HeartPulse size={22} /></div><div><h2 className="font-bold">เช็กอินล่าสุด</h2><p className="text-sm text-[var(--content-muted)]">ผลการประเมินครั้งล่าสุด</p></div></div><span className="text-3xl">{config.emoji}</span></div>
      <div className={`mt-6 rounded-3xl ${config.bg} p-5`}><p className="text-sm font-medium text-[var(--content-muted)]">คะแนนความเครียด</p><div className={`mt-1 text-5xl font-bold ${config.color}`}>{latest.stressScore}<span className="ml-1 text-base font-medium">%</span></div><p className={`mt-3 font-semibold ${config.color}`}>{config.text}</p></div>
      <div className="mt-5 flex items-center justify-between text-sm text-[var(--content-muted)]"><span className="flex items-center gap-1.5"><CalendarDays size={15} /> {new Date(latest.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span><Sparkles size={16} className="text-amber-500" /></div>
    </div>
  );
}
