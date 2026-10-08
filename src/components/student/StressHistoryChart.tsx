"use client";

import { Activity, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props { history: { score: number; createdAt: string }[]; }

export default function StressHistoryChart({ history }: Props) {
  const data = [...history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((item) => ({ date: new Date(item.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short" }), score: item.score }));
  return (
    <section className="wellness-card p-6 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><TrendingUp size={22} /></div><div><h2 className="text-xl font-bold">แนวโน้มความเครียด</h2><p className="mt-1 text-sm text-[var(--content-muted)]">ดูความเปลี่ยนแปลงจากผลประเมินที่ผ่านมา</p></div></div><span className="wellness-badge bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-200"><Activity size={14} /> 0–15 คะแนน</span></div>
      {data.length === 0 ? <div className="mt-6 flex h-64 items-center justify-center rounded-3xl border border-dashed border-teal-200 bg-teal-50/55 text-center dark:border-teal-900 dark:bg-teal-950/20"><div><div className="text-4xl">📈</div><p className="mt-3 text-sm text-[var(--content-muted)]">ผลการประเมินของคุณจะแสดงเป็นกราฟที่นี่</p></div></div> : <div className="mt-6 h-72 sm:h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 16, right: 8, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--content-muted)" }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} domain={[0, 15]} ticks={[0, 3, 6, 9, 12, 15]} tick={{ fontSize: 12, fill: "var(--content-muted)" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--content-text)" }} formatter={(value) => [`${value} คะแนน`, "ความเครียด"]} labelFormatter={(label) => `วันที่ ${label}`} /><Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={3.5} dot={{ r: 4, fill: "#ffffff", stroke: "#14b8a6", strokeWidth: 3 }} activeDot={{ r: 7, fill: "#14b8a6" }} /></LineChart></ResponsiveContainer></div>}
    </section>
  );
}
