"use client";

import {
    Users,
    Heart,
    Activity,
    BarChart3,
    HeartPulse,
    AlertTriangle,
    CalendarClock,
} from "lucide-react";
import Link from "next/link";

import {
    useAdvisorDashboard,
} from "@/hooks/useAdvisorDashboard";

function Card({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}>

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-[var(--content-muted)]">
                        {title}
                    </p>

                    <h2 className="mt-3 text-4xl font-bold">
                        {value}
                    </h2>

                </div>

                <div
                    className={`rounded-full p-4 ${color}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}

export default function AdvisorDashboard() {

    const {

        data,

        loading,

    } = useAdvisorDashboard();

    if (loading) {

        return (

            <main className="flex h-[70vh] items-center justify-center">

                <p className="text-lg">

                    กำลังโหลด...

                </p>

            </main>

        );

    }

    return (

        <main className="advisor-page space-y-6 p-2 sm:p-4">

            <section className="wellness-hero min-h-56 p-6 sm:p-10">
                <div className="relative z-10">
                    <span className="inline-flex rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">✨ พื้นที่ดูแลนิสิต</span>
                    <h1 className="mt-6 text-3xl font-bold text-sky-950 sm:text-4xl">ภาพรวมของนิสิตในความดูแล</h1>
                    <p className="mt-3 max-w-2xl text-[var(--content-muted)]">ติดตามผลประเมินล่าสุดและช่วยเหลือนิสิตได้อย่างทันเวลา</p>
                </div>
                <div className="absolute bottom-7 right-7 z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/90 text-4xl shadow-lg">🤝</div>
            </section>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                <Card
                    title="นิสิตในความดูแล"
                    value={data.totalStudents}
                    icon={<Users className="text-white" />}
                    color="bg-blue-500"
                />

                <Card
                    title="ความเครียดต่ำ"
                    value={data.low}
                    icon={<Heart className="text-white" />}
                    color="bg-green-500"
                />

                <Card
                    title="ความเครียดปานกลาง"
                    value={data.medium}
                    icon={<Activity className="text-white" />}
                    color="bg-yellow-500"
                />

                <Card
                    title="ความเครียดสูง"
                    value={data.high}
                    icon={<BarChart3 className="text-white" />}
                    color="bg-red-500"
                />

                <Card
                    title="คะแนน ST-5 เฉลี่ย"
                    value={data.averageScore}
                    icon={<Activity className="text-white" />}
                    color="bg-purple-500"
                />

                <Card
                    title="ชีพจรเฉลี่ย"
                    value={data.averageBpm}
                    icon={<HeartPulse className="text-white" />}
                    color="bg-pink-500"
                />

            </div>

            <div className="wellness-card p-6 sm:p-8">

                <h2 className="mb-6 text-2xl font-bold">

                    สรุปภาพรวม

                </h2>

                <div className="grid gap-6 md:grid-cols-3">

                    <div className="theme-card-soft rounded-xl p-6">

                        <h3 className="font-semibold">

                            ความเครียดต่ำ

                        </h3>

                        <p className="mt-3 text-5xl font-bold text-[var(--status-low-text)]">

                            {data.low}

                        </p>

                    </div>

                    <div className="theme-card-soft rounded-xl p-6">

                        <h3 className="font-semibold">

                            ความเครียดปานกลาง

                        </h3>

                        <p className="mt-3 text-5xl font-bold text-[var(--status-medium-text)]">

                            {data.medium}

                        </p>

                    </div>

                    <div className="theme-card-soft rounded-xl p-6">

                        <h3 className="font-semibold">

                            ความเครียดสูง

                        </h3>

                        <p className="mt-3 text-5xl font-bold text-[var(--status-high-text)]">

                            {data.high}

                        </p>

                    </div>

                </div>

            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="wellness-card overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-5">
                        <div className="flex items-center gap-3 text-red-800"><AlertTriangle size={22} /><div><h2 className="font-bold">นิสิตที่ควรติดตาม</h2><p className="mt-1 text-sm text-red-700">ผลประเมินล่าสุดอยู่ในระดับสูง</p></div></div>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">{data.highRiskStudents.length} คน</span>
                    </div>
                    {data.highRiskStudents.length ? <div className="divide-y divide-[var(--border)]">{data.highRiskStudents.map((student: any) => <Link key={student.id} href={`/advisor/students/${student.id}`} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[var(--surface-muted)]"><div><p className="font-semibold">{student.fullname}</p><p className="mt-1 text-sm text-[var(--content-muted)]">{student.studentId} · {student.major}{student.phone ? ` · ${student.phone}` : ""}</p></div><div className="text-right"><p className="font-bold text-red-600">{student.latestScore}%</p><p className="text-xs text-[var(--content-muted)]">ดูรายละเอียด</p></div></Link>)}</div> : <p className="px-6 py-10 text-center text-[var(--content-muted)]">ยังไม่มีนิสิตที่มีผลประเมินระดับสูง</p>}
                </section>

                <section className="wellness-card overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-6 py-5"><div className="flex items-center gap-3 text-amber-800"><CalendarClock size={22} /><div><h2 className="font-bold">รอติดตามการประเมิน</h2><p className="mt-1 text-sm text-amber-700">ยังไม่ประเมิน หรือไม่มีผลใน 30 วัน</p></div></div><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">{data.overdueStudents.length} คน</span></div>
                    {data.overdueStudents.length ? <div className="divide-y divide-[var(--border)]">{data.overdueStudents.slice(0, 5).map((student: any) => <Link key={student.id} href={`/advisor/students/${student.id}`} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[var(--surface-muted)]"><div><p className="font-semibold">{student.fullname}</p><p className="mt-1 text-sm text-[var(--content-muted)]">{student.studentId} · {student.major}</p></div><span className="text-sm font-semibold text-amber-700">ดูข้อมูล</span></Link>)}</div> : <p className="px-6 py-10 text-center text-[var(--content-muted)]">นิสิตทุกคนมีผลประเมินล่าสุดแล้ว</p>}
                </section>
            </div>

        </main>

    );

}
