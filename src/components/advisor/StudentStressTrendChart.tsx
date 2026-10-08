"use client";

import { Activity, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = { history: { stressScore: number; createdAt: string }[] };

export default function StudentStressTrendChart({ history }: Props) {
  const data = [...history]
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .map((item) => ({ date: new Date(item.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short" }), score: item.stressScore }));

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-100 p-3 text-blue-600"><TrendingUp size={23} /></div><div><h2 className="text-xl font-bold">แนวโน้มความเครียด</h2><p className="mt-1 text-sm text-[var(--content-muted)]">เปรียบเทียบผลการประเมินที่ผ่านมา</p></div></div>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700"><Activity size={15} /> คะแนน 0–100%</span>
      </div>
      {data.length === 0 ? <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 text-center text-[var(--content-muted)]">ยังไม่มีผลการประเมินเพียงพอสำหรับแสดงแนวโน้ม</div> : <div className="mt-6 h-72 sm:h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 16, right: 12, left: -15, bottom: 4 }}><CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--content-muted)" }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12, fill: "var(--content-muted)" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--content-text)" }} formatter={(value) => [`${value}%`, "คะแนนความเครียด"]} labelFormatter={(label) => `วันที่ ${label}`} /><Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3.5} dot={{ r: 4, fill: "#ffffff", stroke: "#0ea5e9", strokeWidth: 3 }} activeDot={{ r: 7, fill: "#0ea5e9" }} /></LineChart></ResponsiveContainer></div>}
    </section>
  );
}
