"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";

type Advisor = { id: number; fullname: string };
type SupportRequest = {
  id: number;
  type: "ADVISOR_CHANGE" | "PROFILE_CORRECTION";
  status: "PENDING" | "RESOLVED" | "REJECTED";
  details: string;
  response: string | null;
  createdAt: string;
  student: {
    id: number;
    studentId: string;
    fullname: string;
    email: string;
    major: { name: string };
    advisor: { id: number; fullname: string } | null;
  };
};

const typeLabel = {
  ADVISOR_CHANGE: "ขอเปลี่ยนอาจารย์ที่ปรึกษา",
  PROFILE_CORRECTION: "แจ้งข้อมูลส่วนตัวไม่ถูกต้อง",
};

const statusLabel = {
  PENDING: "รอดำเนินการ",
  RESOLVED: "ดำเนินการแล้ว",
  REJECTED: "ไม่ได้รับการอนุมัติ",
};

export default function SupportRequestQueue({ endpoint, title }: { endpoint: string; title: string }) {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [advisorIds, setAdvisorIds] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setRequests(data.requests ?? []);
      setAdvisors(data.advisors ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถโหลดคำขอได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function processRequest(request: SupportRequest, status: "RESOLVED" | "REJECTED") {
    setSavingId(request.id);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          status,
          response: notes[request.id] ?? "",
          advisorId: advisorIds[request.id] ? Number(advisorIds[request.id]) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success(status === "RESOLVED" ? "ดำเนินการคำขอเรียบร้อย" : "ปฏิเสธคำขอเรียบร้อย");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกการดำเนินการได้");
    } finally {
      setSavingId(null);
    }
  }

  const pendingCount = requests.filter((request) => request.status === "PENDING").length;

  return (
    <main className="wellness-page mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <section className="wellness-hero p-6 sm:p-8"><div className="relative z-10"><span className="wellness-badge bg-white/75 text-teal-700 shadow-sm"><Clock3 size={15} /> คิวคำขอจากนิสิต</span><h1 className="mt-4 text-3xl font-bold text-teal-950 sm:text-4xl dark:text-teal-50">{title}</h1><p className="mt-2 text-teal-900/75 dark:text-teal-100/75">ตรวจสอบและดำเนินการคำขอเปลี่ยนอาจารย์ที่ปรึกษาหรือแก้ไขข้อมูลของนิสิต</p></div></section>

      <section className="wellness-card p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-[var(--content-muted)]">คำขอที่รอดำเนินการ</p><p className="mt-1 text-3xl font-bold text-amber-600">{pendingCount}</p></div><Clock3 className="text-amber-500" size={34} /></div></section>

      {loading ? <div className="py-16 text-center text-[var(--content-muted)]">กำลังโหลดคำขอ...</div> : requests.length === 0 ? <div className="wellness-card p-10 text-center text-[var(--content-muted)]">ยังไม่มีคำขอจากนิสิต</div> : <section className="space-y-4">
        {requests.map((request) => {
          const pending = request.status === "PENDING";
          return <article key={request.id} className="wellness-card p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{typeLabel[request.type]}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === "PENDING" ? "bg-amber-100 text-amber-700" : request.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{statusLabel[request.status]}</span></div><p className="mt-2 text-sm text-[var(--content-muted)]">{request.student.fullname} · {request.student.studentId} · {request.student.major.name}</p><p className="mt-1 text-sm text-[var(--content-muted)]">อีเมล {request.student.email} · อาจารย์ปัจจุบัน {request.student.advisor?.fullname ?? "ยังไม่กำหนด"}</p></div><p className="text-sm text-[var(--content-muted)]">{new Date(request.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</p></div>
            <div className="mt-4 rounded-2xl bg-[var(--surface-muted)] p-4 text-sm leading-6">{request.details}</div>
            {pending ? <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-5">
              {request.type === "ADVISOR_CHANGE" && <label className="block text-sm font-medium">กำหนดอาจารย์ที่ปรึกษาใหม่<select value={advisorIds[request.id] ?? ""} onChange={(event) => setAdvisorIds((current) => ({ ...current, [request.id]: event.target.value }))} className="mt-2 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><option value="">เลือกอาจารย์ที่ปรึกษา</option>{advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.fullname}</option>)}</select></label>}
              <textarea value={notes[request.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} maxLength={1000} rows={3} placeholder="บันทึกคำตอบหรือรายละเอียดการดำเนินการ (ไม่บังคับ)" className="wellness-input w-full resize-none p-3" />
              <div className="flex flex-wrap gap-3"><button disabled={savingId === request.id} onClick={() => processRequest(request, "RESOLVED")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"><CheckCircle2 size={17} /> ดำเนินการแล้ว</button><button disabled={savingId === request.id} onClick={() => processRequest(request, "REJECTED")} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 font-semibold text-rose-700 disabled:opacity-60"><XCircle size={17} /> ปฏิเสธคำขอ</button></div>
            </div> : request.response && <p className="mt-4 rounded-xl bg-[var(--surface-muted)] p-3 text-sm">บันทึกจากผู้ดำเนินการ: {request.response}</p>}
          </article>;
        })}
      </section>}
    </main>
  );
}
