"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MessageSquareText, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type FollowUpStatus = "NOT_CONTACTED" | "CONTACTED" | "FOLLOW_UP_SCHEDULED" | "CLOSED";

type FollowUp = {
  id: number;
  status: FollowUpStatus;
  note: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  handledBy: { fullname: string; role: string };
};

const statusOptions: { value: FollowUpStatus; label: string }[] = [
  { value: "NOT_CONTACTED", label: "ยังไม่ติดต่อ" },
  { value: "CONTACTED", label: "ติดต่อแล้ว" },
  { value: "FOLLOW_UP_SCHEDULED", label: "นัดติดตาม" },
  { value: "CLOSED", label: "ปิดเรื่อง" },
];

const statusStyle: Record<FollowUpStatus, string> = {
  NOT_CONTACTED: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-sky-100 text-sky-700",
  FOLLOW_UP_SCHEDULED: "bg-amber-100 text-amber-800",
  CLOSED: "bg-emerald-100 text-emerald-700",
};

const statusLabel = (status: FollowUpStatus) => statusOptions.find((option) => option.value === status)?.label ?? status;

export default function RiskFollowUpPanel({ studentId }: { studentId: number }) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [status, setStatus] = useState<FollowUpStatus>("NOT_CONTACTED");
  const [note, setNote] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadFollowUps = async () => {
    try {
      const response = await fetch(`/api/risk-follow-ups/${studentId}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setFollowUps(data.followUps ?? []);
    } catch {
      toast.error("ไม่สามารถโหลดประวัติการติดตามได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadFollowUps(); }, [studentId]);

  const saveFollowUp = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/risk-follow-ups/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, nextFollowUpAt }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message ?? "ไม่สามารถบันทึกการติดตามได้");
        return;
      }
      setFollowUps((items) => [data.followUp, ...items]);
      setNote("");
      setNextFollowUpAt("");
      toast.success(data.message);
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setSaving(false);
    }
  };

  return <section className="rounded-2xl border border-amber-200 bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-3 text-xl font-bold"><ShieldAlert className="text-amber-600" /> การติดตามนิสิตความเสี่ยง</h2><p className="mt-1 text-sm text-[var(--content-muted)]">บันทึกทุกครั้งจะเก็บเป็นประวัติ เพื่อให้ทีมติดตามงานต่อได้</p></div>{followUps[0] && <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusStyle[followUps[0].status]}`}>สถานะล่าสุด: {statusLabel(followUps[0].status)}</span>}</div>

    <div className="mt-6 grid gap-4 md:grid-cols-2"><label className="space-y-2"><span className="font-medium">เปลี่ยนสถานะ</span><select value={status} onChange={(event) => setStatus(event.target.value as FollowUpStatus)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-amber-500">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="space-y-2"><span className="flex items-center gap-2 font-medium"><CalendarDays size={16} /> วันนัดครั้งถัดไป {status === "FOLLOW_UP_SCHEDULED" && <span className="text-red-600">*</span>}</span><input type="date" value={nextFollowUpAt} onChange={(event) => setNextFollowUpAt(event.target.value)} disabled={status === "CLOSED"} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-amber-500 disabled:bg-slate-100" /></label></div>
    <label className="mt-4 block space-y-2"><span className="flex items-center gap-2 font-medium"><MessageSquareText size={16} /> โน้ตการติดตาม <span className="text-[var(--content-muted)]">(ไม่บังคับ)</span></span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={3} placeholder="เช่น โทรติดต่อแล้ว นิสิตขอเลื่อนนัด หรือรายละเอียดที่ทีมควรทราบ" className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-amber-500" /></label>
    <div className="mt-4 flex justify-end"><button onClick={saveFollowUp} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-bold text-white hover:bg-amber-600 disabled:bg-slate-300"><Save size={17} />{saving ? "กำลังบันทึก..." : "บันทึกการติดตาม"}</button></div>

    <div className="mt-8 border-t border-[var(--border)] pt-6"><h3 className="font-bold">ประวัติการติดตาม</h3>{loading ? <p className="py-5 text-sm text-[var(--content-muted)]">กำลังโหลด...</p> : followUps.length ? <div className="mt-4 space-y-3">{followUps.map((item) => <article key={item.id} className="rounded-xl border border-[var(--border)] p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusStyle[item.status]}`}>{statusLabel(item.status)}</span><span className="text-sm text-[var(--content-muted)]">{new Date(item.createdAt).toLocaleString("th-TH")} · {item.handledBy.fullname}</span></div>{item.note && <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{item.note}</p>}{item.nextFollowUpAt && <p className="mt-3 text-sm font-medium text-amber-700">นัดครั้งถัดไป: {new Date(item.nextFollowUpAt).toLocaleDateString("th-TH")}</p>}</article>)}</div> : <p className="py-5 text-sm text-[var(--content-muted)]">ยังไม่มีประวัติการติดตาม</p>}</div>
  </section>;
}
