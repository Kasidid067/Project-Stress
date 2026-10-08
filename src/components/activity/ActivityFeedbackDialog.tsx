"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";

type FeedbackMood = "BETTER" | "SAME" | "WORSE";

type Props = {
  activityTitle: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (mood: FeedbackMood, note: string) => void;
};

const moods: { value: FeedbackMood; label: string; description: string }[] = [
  { value: "BETTER", label: "รู้สึกดีขึ้น", description: "ผ่อนคลายหรือสบายใจขึ้น" },
  { value: "SAME", label: "รู้สึกเหมือนเดิม", description: "ยังไม่เห็นความเปลี่ยนแปลง" },
  { value: "WORSE", label: "รู้สึกแย่ลง", description: "อยากให้ผู้ดูแลช่วยติดตาม" },
];

export default function ActivityFeedbackDialog({ activityTitle, saving, onClose, onSubmit }: Props) {
  const [mood, setMood] = useState<FeedbackMood | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={() => !saving && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="activity-feedback-title" className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-rose-100 p-3 text-rose-600"><Heart size={24} /></div><div><h2 id="activity-feedback-title" className="text-xl font-bold">หลังทำกิจกรรมรู้สึกอย่างไรบ้าง?</h2><p className="mt-1 text-sm text-[var(--content-muted)]">{activityTitle}</p></div></div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="ปิด" className="rounded-xl p-2 text-[var(--content-muted)] hover:bg-[var(--surface-muted)] disabled:opacity-50"><X size={20} /></button>
        </div>
        <div className="mt-6 grid gap-3">
          {moods.map((option) => <button key={option.value} type="button" onClick={() => setMood(option.value)} className={`rounded-2xl border p-4 text-left transition ${mood === option.value ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-950/30" : "border-[var(--border)] hover:bg-[var(--surface-muted)]"}`}><p className="font-semibold">{option.label}</p><p className="mt-1 text-sm text-[var(--content-muted)]">{option.description}</p></button>)}
        </div>
        <label className="mt-5 block text-sm font-medium">อยากบอกอะไรเพิ่มเติมไหม? <span className="font-normal text-[var(--content-muted)]">(ไม่บังคับ)</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} rows={3} placeholder="เช่น รู้สึกผ่อนคลายขึ้นหลังได้พัก..." className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 outline-none focus:border-teal-500" /></label>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-[var(--border)] px-4 py-2.5 font-medium disabled:opacity-50">ยกเลิก</button><button type="button" disabled={!mood || saving} onClick={() => mood && onSubmit(mood, note)} className="rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "กำลังบันทึก..." : "บันทึกการทำกิจกรรม"}</button></div>
      </div>
    </div>,
    document.body
  );
}
