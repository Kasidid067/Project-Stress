"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Brain, HeartPulse, Phone, UserRound } from "lucide-react";
import ST5AnswerList from "@/components/assessment/ST5AnswerList";

type ResultDetail = {
  stressScore: number; stressLevel: "LOW" | "MEDIUM" | "HIGH"; recommendation: string | null; aiSummary: string | null; createdAt: string;
  pulse: { bpm: number } | null;
  assessment: { totalScore: number; answers: { id: number; questionNo: number; score: number }[] };
  user: { fullname: string; studentId: string; phone: string | null; major: { name: string } };
};

const levelStyle = { LOW: "bg-emerald-100 text-emerald-700", MEDIUM: "bg-amber-100 text-amber-700", HIGH: "bg-rose-100 text-rose-700" };
const levelText = { LOW: "ต่ำ", MEDIUM: "ปานกลาง", HIGH: "สูง" };

export default function AdminAssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/admin/assessments/${id}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data) => setResult(data?.result ?? null)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-[var(--content-muted)]">กำลังโหลดผลการประเมิน...</div>;
  if (!result) return <main className="admin-page wellness-page"><section className="admin-surface p-8 text-center"><h1 className="text-xl font-bold">ไม่พบผลการประเมิน</h1><Link href="/admin/dashboard" className="mt-5 inline-block rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white">กลับแดชบอร์ด</Link></section></main>;

  return <main className="admin-page wellness-page mx-auto max-w-5xl space-y-6">
    <section className="admin-surface overflow-hidden p-0"><div className="bg-gradient-to-r from-rose-500 to-orange-400 p-6 text-white sm:p-8"><p className="text-sm font-semibold opacity-90">รายละเอียดผลการประเมิน ST-5</p><div className="mt-3 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">{result.user.fullname}</h1><p className="mt-1 opacity-90">รหัสนิสิต {result.user.studentId} · {result.user.major.name}</p></div><span className={`rounded-full px-4 py-2 text-sm font-bold ${levelStyle[result.stressLevel]}`}>ความเครียด{levelText[result.stressLevel]}</span></div></div><div className="grid gap-4 p-6 sm:grid-cols-3"><div className="flex items-center gap-3"><UserRound className="text-teal-600" size={20} /><div><p className="text-xs text-[var(--content-muted)]">คะแนนความเครียด</p><p className="text-2xl font-bold">{result.stressScore}%</p><p className="text-xs text-[var(--content-muted)]">ST-5 {result.assessment.totalScore}/15</p></div></div><div className="flex items-center gap-3"><Phone className="text-teal-600" size={20} /><div><p className="text-xs text-[var(--content-muted)]">เบอร์โทรศัพท์</p><p className="font-semibold">{result.user.phone || "ยังไม่ได้ระบุ"}</p></div></div><div><p className="text-xs text-[var(--content-muted)]">วันที่ประเมิน</p><p className="font-semibold">{new Date(result.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</p></div></div></section>
    <section className="grid gap-6 md:grid-cols-2"><div className="admin-surface p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><HeartPulse className="text-rose-500" />ข้อมูลชีพจร</h2><div className="mt-5 rounded-2xl bg-rose-50 p-4"><p className="text-sm text-[var(--content-muted)]">ชีพจร</p><p className="mt-1 text-3xl font-bold">{result.pulse?.bpm ?? "-"} <span className="text-sm font-medium">ครั้ง/นาที</span></p><p className="mt-2 text-xs text-[var(--content-muted)]">ใช้เป็นข้อมูลประกอบการดูแล ไม่หักคะแนน ST-5</p></div></div><div className="admin-surface p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><Brain className="text-violet-600" />สรุปผล</h2><p className="mt-5 leading-7 text-[var(--content-text)]">{result.aiSummary || "ไม่มีสรุปผลเพิ่มเติม"}</p></div></section>
    <section className="admin-surface p-6"><h2 className="text-lg font-bold">คำแนะนำสำหรับนิสิต</h2><p className="mt-4 leading-7 text-[var(--content-text)]">{result.recommendation || "ไม่มีคำแนะนำ"}</p></section>
    <section className="admin-surface p-6"><h2 className="text-lg font-bold">คำถามและคำตอบแบบประเมิน ST-5</h2><ST5AnswerList answers={result.assessment.answers} /></section>
    <Link href="/admin/dashboard" className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-semibold hover:bg-[var(--surface-muted)]">กลับแดชบอร์ด</Link>
  </main>;
}
