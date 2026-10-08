"use client";

import {
    Users,
    UserCheck,
    Heart,
    Activity,
    HeartPulse,
    AlertTriangle,
    CalendarClock,
    ClipboardList,
} from "lucide-react";
import Link from "next/link";

import {
    useStaffDashboard,
} from "@/hooks/useStaffDashboard";

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

export default function StaffDashboardPage() {
    const {
        data,
        loading,
    } = useStaffDashboard();

    if (loading) {
        return (
            <main className="flex h-[70vh] items-center justify-center">
                กำลังโหลด...
            </main>
        );
    }

    return (
        <main className="staff-page space-y-6 p-2 sm:p-4">
            <section className="wellness-hero min-h-56 p-6 sm:p-10">
                <div className="relative z-10">
                    <span className="inline-flex rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">✨ ภาพรวมข้อมูล</span>
                    <h1 className="mt-6 text-3xl font-bold text-orange-950 sm:text-4xl">สวัสดี เจ้าหน้าที่กิจการนิสิต 👋</h1>
                    <p className="mt-3 max-w-2xl text-[var(--content-muted)]">ติดตามภาพรวมสุขภาวะของนิสิต เพื่อช่วยดูแลและวางแผนกิจกรรมได้อย่างเหมาะสม</p>
                </div>
                <div className="absolute bottom-7 right-7 z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/90 text-4xl shadow-lg">🫶</div>
            </section>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                <Card
                    title="นิสิตทั้งหมด"
                    value={data.totalStudents}
                    icon={<Users className="text-white" />}
                    color="bg-blue-500"
                />
                <Card
                    title="อาจารย์ที่ปรึกษา"
                    value={data.totalAdvisors}
                    icon={<UserCheck className="text-white" />}
                    color="bg-purple-500"
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
                    icon={<HeartPulse className="text-white" />}
                    color="bg-red-500"
                />
                <Card title="รอติดตามผล" value={data.overdueStudents.length} icon={<CalendarClock className="text-white" />} color="bg-amber-500" />
                <Card title="คำขอรอดำเนินการ" value={data.pendingSupportRequests} icon={<ClipboardList className="text-white" />} color="bg-violet-500" />
            </div>
            <div className="wellness-card p-6 sm:p-8">
                <h2 className="mb-2 text-2xl font-bold">สัดส่วนระดับความเครียด</h2>
                <p className="mb-6 text-sm text-[var(--content-muted)]">อ้างอิงจากผลประเมินล่าสุดของนิสิตแต่ละคน</p>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="status-low rounded-xl p-6">
                        <h3 className="font-semibold">
                        ความเครียดต่ำ
                        </h3>
                        <p className="mt-3 text-5xl font-bold">
                            {data.low}
                        </p>
                    </div>
                    <div className="status-medium rounded-xl p-6">
                        <h3 className="font-semibold">
                            ความเครียดปานกลาง
                        </h3>
                        <p className="mt-3 text-5xl font-bold">
                            {data.medium}
                        </p>
                    </div>
                    <div className="status-high rounded-xl p-6">
                        <h3 className="font-semibold">
                            ความเครียดสูง
                        </h3>
                        <p className="mt-3 text-5xl font-bold">
                            {data.high}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="wellness-card overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-5"><div className="flex items-center gap-3 text-red-800"><AlertTriangle size={22} /><div><h2 className="font-bold">คิวติดตามนิสิตความเครียดสูง</h2><p className="mt-1 text-sm text-red-700">เรียงจากผลประเมินล่าสุด</p></div></div><span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">{data.highRiskStudents.length} รายการ</span></div>
                    {data.highRiskStudents.length ? <div className="divide-y divide-[var(--border)]">{data.highRiskStudents.map((student: any) => <Link key={student.id} href={`/staff/students/${student.id}`} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[var(--surface-muted)]"><div><p className="font-semibold">{student.fullname}</p><p className="mt-1 text-sm text-[var(--content-muted)]">{student.studentId} · {student.major}{student.phone ? ` · ${student.phone}` : ""}</p></div><p className="font-bold text-red-600">{student.latestScore}%</p></Link>)}</div> : <p className="px-6 py-10 text-center text-[var(--content-muted)]">ยังไม่มีนิสิตที่มีผลประเมินระดับสูง</p>}
                </section>

                <section className="wellness-card p-6 sm:p-8"><h2 className="text-xl font-bold">ภาพรวมตามหลักสูตร</h2><p className="mt-1 text-sm text-[var(--content-muted)]">จำนวนผู้ประเมินและผู้มีความเครียดสูง</p><div className="mt-5 space-y-3">{data.majorSummaries.length ? data.majorSummaries.map((item: any) => <div key={item.major} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><p className="font-semibold">{item.major}</p><div className="mt-2 flex items-center justify-between text-sm"><span className="text-[var(--content-muted)]">นิสิต {item.total} คน</span><span className={item.high ? "font-bold text-red-600" : "font-semibold text-green-600"}>ความเครียดสูง {item.high} คน</span></div></div>) : <p className="py-8 text-center text-[var(--content-muted)]">ยังไม่มีข้อมูลนิสิต</p>}</div></section>
            </div>
        </main>
    );
}
