"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { ST5_CHOICES } from "@/data/st5Choice";
import { ST5_QUESTIONS } from "@/data/st5";
import ReferenceLinks from "@/components/common/ReferenceLinks";

export default function ST5Page() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(Array(ST5_QUESTIONS.length).fill(-1));
  const [pulseBpm, setPulseBpm] = useState("");
  const [saving, setSaving] = useState(false);

  function selectAnswer(questionIndex: number, score: number) {
    setAnswers((current) => current.map((answer, index) => index === questionIndex ? score : answer));
  }

  async function handleSubmit() {
    const bpm = Number(pulseBpm);
    if (!Number.isInteger(bpm) || bpm < 30 || bpm > 220) return toast.error("กรุณากรอกค่าชีพจรระหว่าง 30-220 BPM");
    if (answers.includes(-1)) return toast.error("กรุณาตอบคำถามให้ครบทั้ง 5 ข้อ");
    setSaving(true);
    try {
      const response = await fetch("/api/student/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pulseBpm: bpm, answers: answers.map((score, index) => ({ questionNo: index + 1, score })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "ไม่สามารถบันทึกแบบประเมินได้");
      toast.success("บันทึกผลการประเมินเรียบร้อยแล้ว");
      router.push(`/student/result/${data.assessmentId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกแบบประเมินได้");
    } finally { setSaving(false); }
  }

  return <main className="wellness-page mx-auto max-w-6xl space-y-7 p-5 sm:p-8">
    <section className="wellness-hero p-7 sm:p-10"><p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-teal-700 shadow-sm">แบบประเมินสุขภาวะ</p><h1 className="mt-4 text-3xl font-bold text-teal-950 sm:text-4xl">แบบประเมิน ST-5</h1><p className="mt-3 text-[var(--content-muted)]">โปรดเลือกคำตอบที่ตรงกับความรู้สึกของคุณในช่วง 2-4 สัปดาห์ที่ผ่านมา</p></section>
    <section className="wellness-card overflow-hidden"><div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white"><div className="flex items-center gap-3"><ClipboardCheck size={26} /><div><h2 className="text-xl font-bold">คำแนะนำการตอบแบบประเมิน ST-5</h2><p className="mt-1 text-sm text-white/90">ตอบตามความรู้สึกจริงของคุณ ไม่มีคำตอบที่ถูกหรือผิด</p></div></div></div><div className="grid gap-5 p-6 md:grid-cols-2"><div className="rounded-2xl border border-[var(--border)] p-4"><h3 className="font-bold">เกณฑ์คำตอบ</h3><div className="mt-3 grid grid-cols-2 gap-2 text-sm">{ST5_CHOICES.map((choice) => <div key={choice.score} className="rounded-xl bg-[var(--surface-muted)] p-3"><b>{choice.score}</b> · {choice.text}</div>)}</div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><h3 className="font-bold">การแปลผลคะแนน</h3><p className="mt-3 text-sm leading-6">0-4 ระดับต่ำ · 5-7 ระดับปานกลาง · 8-15 ระดับสูง</p><p className="mt-2 text-sm">ผลนี้ใช้คัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยโรค</p></div></div></section>
    <section className="wellness-card p-6"><div className="flex items-start gap-3"><div className="rounded-2xl bg-rose-100 p-3 text-rose-600"><HeartPulse size={24} /></div><div><h2 className="font-bold">ค่าชีพจรที่ใช้ประกอบผลการประเมิน</h2><p className="mt-1 text-sm text-[var(--content-muted)]">หากวัดไว้แล้วช่วงเช้า ให้กรอกค่า BPM เดิมได้ ระบบจะบันทึกค่าไว้คู่กับผลครั้งนี้</p></div></div><label className="mt-5 block max-w-md"><span className="mb-2 block font-semibold">ชีพจร (BPM)</span><input type="number" inputMode="numeric" min="30" max="220" value={pulseBpm} onChange={(event) => setPulseBpm(event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="เช่น 78" className="wellness-input w-full p-3" /></label></section>
    <div className="space-y-5">{ST5_QUESTIONS.map((item, index) => <section key={item.id} className="wellness-card p-6"><h2 className="text-lg font-bold">ข้อ {item.id}</h2><p className="mt-3 text-lg">{item.question}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{ST5_CHOICES.map((choice) => <button key={choice.score} type="button" onClick={() => selectAnswer(index, choice.score)} className={`rounded-2xl border p-4 text-center transition ${answers[index] === choice.score ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-[var(--border)] hover:border-teal-300"}`}><span className="block text-3xl font-bold">{choice.score}</span><span className="mt-2 block text-sm text-[var(--content-muted)]">{choice.text}</span></button>)}</div></section>)}</div>
    <button type="button" disabled={saving} onClick={handleSubmit} className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-4 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{saving ? "กำลังบันทึก..." : "ส่งแบบประเมิน ST-5"}</button>
    <ReferenceLinks references={[{ title: "กรมสุขภาพจิต กระทรวงสาธารณสุข: แบบประเมินความเครียด (ST-5)", description: "แหล่งข้อมูลแบบประเมิน ST-5 และรายการแบบประเมินสุขภาพจิต", href: "https://dmhpd.dmh.go.th/%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%A1%E0%B8%B4%E0%B8%99/" }]} />
  </main>;
}
