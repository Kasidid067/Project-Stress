"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { PSS10_OPTIONS, PSS10_QUESTIONS } from "@/data/pss10Questions";
import ReferenceLinks from "@/components/common/ReferenceLinks";

export default function PSS10Page() {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [pulseBpm, setPulseBpm] = useState("");
  const [saving, setSaving] = useState(false);

  function selectAnswer(questionIndex: number, score: number) {
    setAnswers((current) => current.map((answer, index) => index === questionIndex ? score : answer));
  }

  async function submit() {
    const bpm = Number(pulseBpm);
    if (!Number.isInteger(bpm) || bpm < 30 || bpm > 220) return toast.error("กรุณากรอกค่าชีพจรระหว่าง 30-220 BPM");
    if (answers.some((answer) => answer === null)) return toast.error("กรุณาตอบคำถามให้ครบทั้ง 10 ข้อ");
    setSaving(true);
    try {
      const response = await fetch("/api/student/pss10", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pulseBpm: bpm, answers: answers.map((score, index) => ({ questionNo: index + 1, score })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "ไม่สามารถบันทึกแบบประเมินได้");
      toast.success("บันทึกแบบประเมิน PSS-10 เรียบร้อยแล้ว");
      router.push("/student/pss10/history");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกแบบประเมินได้");
    } finally { setSaving(false); }
  }

  return <main className="wellness-page mx-auto max-w-6xl space-y-7 p-5 sm:p-8">
    <section className="wellness-hero p-7 sm:p-10"><p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-teal-700 shadow-sm">แบบประเมินสุขภาวะ</p><h1 className="mt-4 text-3xl font-bold text-teal-950 sm:text-4xl">แบบประเมิน PSS-10</h1><p className="mt-3 text-[var(--content-muted)]">โปรดตอบตามความรู้สึกและความคิดของคุณในช่วง 1 เดือนที่ผ่านมา</p></section>
    <section className="wellness-card overflow-hidden"><div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white"><div className="flex items-center gap-3"><Brain size={26} /><div><h2 className="text-xl font-bold">คำแนะนำการตอบแบบประเมิน PSS-10</h2><p className="mt-1 text-sm text-white/90">ผลใช้ติดตามการรับรู้ความเครียด ไม่ใช่การวินิจฉัยโรค</p></div></div></div><div className="p-6"><div className="rounded-2xl border border-[var(--border)] p-4"><h3 className="font-bold">ตัวเลือกคะแนน</h3><div className="mt-3 grid gap-2 sm:grid-cols-5">{PSS10_OPTIONS.map((label, score) => <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-3 text-center text-sm"><b>{score}</b> · {label}</div>)}</div></div></div></section>
    <section className="wellness-card p-6"><div className="flex items-start gap-3"><div className="rounded-2xl bg-rose-100 p-3 text-rose-600"><HeartPulse size={24} /></div><div><h2 className="font-bold">ค่าชีพจรที่วัดไว้ก่อนทำแบบประเมิน</h2><p className="mt-1 text-sm text-[var(--content-muted)]">หากวัดไว้แล้วช่วงเช้า ให้กรอกค่า BPM เดิมได้ ระบบจะบันทึกค่าไว้คู่กับผลครั้งนี้</p></div></div><label className="mt-5 block max-w-md"><span className="mb-2 block font-semibold">ชีพจร (BPM)</span><input type="number" inputMode="numeric" min="30" max="220" value={pulseBpm} onChange={(event) => setPulseBpm(event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="เช่น 78" className="wellness-input w-full p-3" /></label></section>
    <div className="space-y-5">{PSS10_QUESTIONS.map((question, index) => <section key={question} className="wellness-card p-6"><h2 className="text-lg font-bold">ข้อ {index + 1}</h2><p className="mt-3 text-lg leading-8">{question}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{PSS10_OPTIONS.map((label, score) => <button key={label} type="button" onClick={() => selectAnswer(index, score)} className={`rounded-2xl border p-4 text-center transition ${answers[index] === score ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-[var(--border)] hover:border-teal-300"}`}><span className="block text-3xl font-bold">{score}</span><span className="mt-2 block text-sm text-[var(--content-muted)]">{label}</span></button>)}</div></section>)}</div>
    <button type="button" disabled={saving} onClick={submit} className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-4 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{saving ? "กำลังบันทึก..." : "ส่งแบบประเมิน PSS-10"}</button>
    <ReferenceLinks references={[{ title: "Cohen, Kamarck & Mermelstein (1983): A Global Measure of Perceived Stress", description: "งานวิจัยต้นฉบับของ Perceived Stress Scale (PSS)", href: "https://pubmed.ncbi.nlm.nih.gov/6668417/" }]} />
  </main>;
}
