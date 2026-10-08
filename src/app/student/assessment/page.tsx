"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse } from "lucide-react";

import ST5Question from "@/components/student/ST5Question";
import { ST5_QUESTIONS } from "@/data/st5Questions";

const ST5_SCORE_GUIDE = [
    { score: 0, meaning: "เป็นน้อยมากหรือแทบไม่มี" },
    { score: 1, meaning: "เป็นบางครั้ง" },
    { score: 2, meaning: "เป็นบ่อยครั้ง" },
    { score: 3, meaning: "เป็นประจำ" },
];

const ST5_INTERPRETATION = [
    { range: "0 - 4", level: "ความเครียดน้อย", color: "text-emerald-700" },
    { range: "5 - 7", level: "ความเครียดปานกลาง", color: "text-amber-600" },
    { range: "8 - 15", level: "ความเครียดมาก", color: "text-red-600" },
];

export default function AssessmentPage() {
    const router = useRouter();

    const [answers, setAnswers] = useState<(number | null)[]>(
        Array(5).fill(null)
    );
    const [pulseBpm, setPulseBpm] = useState("");

    function updateAnswer(index: number, score: number) {
        const copy = [...answers];
        copy[index] = score;
        setAnswers(copy);
    }

    async function submit() {
        const bpm = Number(pulseBpm);
        if (!Number.isInteger(bpm) || bpm < 30 || bpm > 220) {
            alert("กรุณากรอกค่าชีพจรระหว่าง 30-220 BPM");
            return;
        }

        if (answers.some((answer) => answer === null)) {
            alert("กรุณาตอบคำถามให้ครบทุกข้อ");
            return;
        }

        const payload = answers.map((score, index) => ({
            questionNo: index + 1,
            score: score as number,
        }));

        try {
            const res = await fetch("/api/student/assessment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    answers: payload,
                    pulseBpm: bpm,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "เกิดข้อผิดพลาด");
                return;
            }

            router.push(`/student/result/${data.assessmentId}`);
        } catch (error) {
            console.error(error);
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    }

    return (
        <main className="wellness-page mx-auto max-w-6xl space-y-8 p-5 md:p-8">
            <div className="wellness-hero space-y-3 p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-teal-950 sm:text-4xl dark:text-teal-50">
                    แบบประเมิน ST-5
                </h1>

                <p className="max-w-3xl leading-7 text-teal-900/75 dark:text-teal-100/75">
                    กรุณาเลือกคำตอบที่ตรงกับความรู้สึกของคุณในช่วง 2–4 สัปดาห์ที่ผ่านมา
                </p>
            </div>

            {/* คู่มือการตอบแบบประเมิน */}
            <section className="wellness-card overflow-hidden">
                <div className="border-b bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white">
                        📋 คำแนะนำการตอบแบบประเมิน ST-5
                    </h2>
                    <p className="mt-1 text-sm text-emerald-50">
                        โปรดเลือกคำตอบที่ตรงกับความรู้สึกของท่านในช่วง 2–4
                        สัปดาห์ที่ผ่านมา
                    </p>
                </div>

                <div className="grid gap-8 p-6 lg:grid-cols-2">
                    {/* เกณฑ์คะแนน */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            เกณฑ์คะแนน
                        </h3>

                        <div className="overflow-hidden rounded-xl border">
                            <table className="w-full text-left">
                                <thead className="bg-emerald-50">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            คะแนน
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            ความหมาย
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {ST5_SCORE_GUIDE.map((item) => (
                                        <tr
                                            key={item.score}
                                            className="border-t"
                                        >
                                            <td className="px-4 py-3 font-bold text-emerald-700">
                                                {item.score}
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {item.meaning}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* การแปลผล */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-slate-800">
                            การแปลผลคะแนน
                        </h3>

                        <div className="overflow-hidden rounded-xl border">
                            <table className="w-full text-left">
                                <thead className="bg-sky-50">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            คะแนนรวม
                                        </th>

                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            ระดับความเครียด
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {ST5_INTERPRETATION.map((item) => (
                                        <tr
                                            key={item.range}
                                            className="border-t"
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {item.range}
                                            </td>

                                            <td
                                                className={`px-4 py-3 font-bold ${item.color}`}
                                            >
                                                {item.level}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <h4 className="font-semibold text-emerald-700">
                                หมายเหตุ
                            </h4>

                            <p className="mt-2 text-sm leading-7 text-slate-700">
                                • โปรดตอบตามความรู้สึกของท่านในช่วง
                                <strong> 2–4 สัปดาห์ที่ผ่านมา</strong>
                                <br />
                                • เลือกคะแนนที่ตรงกับความถี่ของอาการมากที่สุด
                                <br />
                                • ผลคะแนน ST-5
                                จะถูกนำไปใช้ร่วมกับข้อมูลชีพจรเพื่อช่วยในการประเมินระดับความเครียด
                                <br />
                                • แบบประเมินนี้ใช้สำหรับการคัดกรองเบื้องต้น
                                ไม่ใช่การวินิจฉัยโรค
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="wellness-card p-6">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                        <HeartPulse size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold">ค่าชีพจรที่ใช้ประกอบผลการประเมิน</h2>
                        <p className="mt-1 text-sm text-[var(--content-muted)]">
                            หากวัดไว้แล้วช่วงเช้า ให้กรอกค่า BPM เดิมได้ ระบบจะบันทึกค่าไว้คู่กับผลครั้งนี้
                        </p>
                    </div>
                </div>
                <label className="mt-5 block max-w-md">
                    <span className="mb-2 block font-semibold">ชีพจร (BPM)</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        min="30"
                        max="220"
                        value={pulseBpm}
                        onChange={(event) => setPulseBpm(event.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="เช่น 78"
                        className="wellness-input w-full p-3"
                    />
                </label>
            </section>
            <div className="space-y-6">
                {ST5_QUESTIONS.map((item, index) => (
                    <ST5Question
                        key={item.no}
                        no={item.no}
                        question={item.question}
                        value={answers[index]}
                        onChange={(score) => updateAnswer(index, score)}
                    />
                ))}
            </div>

            <div className="space-y-3">
                <button
                    onClick={submit}
                    className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-4 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                    ส่งแบบประเมิน
                </button>

                <p className="text-center text-sm text-slate-500">
                    ผลการประเมินนี้ใช้สำหรับการคัดกรองระดับความเครียดเบื้องต้น
                    โดยใช้ร่วมกับข้อมูลชีพจร และไม่ใช่การวินิจฉัยโรค
                </p>
            </div>
        </main>
    );
}
