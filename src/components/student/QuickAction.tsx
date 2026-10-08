import Link from "next/link";
import { ArrowRight, ClipboardPenLine, History, HeartPulse } from "lucide-react";

export default function QuickAction() {
  return (
    <div className="wellness-card p-6">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-950/45 dark:text-sky-300"><HeartPulse size={22} /></div><div><h2 className="font-bold">ทำต่อเลย</h2><p className="text-sm text-[var(--content-muted)]">เลือกสิ่งที่อยากทำตอนนี้</p></div></div>
      <div className="mt-6 space-y-3">
        <Link href="/student/assessment" className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 p-4 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg"><span className="flex items-center gap-2 font-semibold"><ClipboardPenLine size={19} /> เริ่มประเมินความเครียด</span><ArrowRight size={18} className="transition group-hover:translate-x-1" /></Link>
        <Link href="/student/history" className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-[var(--content-text)] hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"><span className="flex items-center gap-2 font-semibold"><History size={19} className="text-teal-600" /> ดูประวัติการทำกิจกรรม</span><ArrowRight size={18} className="text-[var(--content-muted)] transition group-hover:translate-x-1" /></Link>
      </div>
    </div>
  );
}
