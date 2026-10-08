"use client";

import {
    HeartPulse,
    Brain,
} from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { stressLevelLabel } from "@/lib/displayLabels";
import StudentStressTrendChart from "@/components/advisor/StudentStressTrendChart";
import ST5AnswerList from "@/components/assessment/ST5AnswerList";

interface Props {

    open: boolean;

    data: any;

    history: any[];

    onClose: () => void;

}

export default function AssessmentDetailDialog({

    open,

    data,

    history,

    onClose,

}: Props) {

    const dialogRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"result" | "history">("result");

    useEffect(() => {
        if (open) {
            dialogRef.current?.scrollTo({ top: 0 });
            setActiveTab("result");
        }
    }, [open, data?.id]);

    if (!open || !data) return null;

    return createPortal(

        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
            onMouseDown={onClose}
        >

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                className="wellness-card max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto p-5 sm:p-8"
                onMouseDown={(event) => event.stopPropagation()}
            >

                <div className="-mx-5 -mt-5 mb-8 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:-mx-8 sm:-mt-8 sm:px-8">

                    <h2 className="text-3xl font-bold text-green-700">

                        ผลการประเมิน ST-5

                    </h2>

                    <button

                        onClick={onClose}

                        className="rounded-lg border px-4 py-2"

                    >

                        ปิด

                    </button>

                </div>

                <div className="mb-6 flex gap-2 border-b border-[var(--border)] pb-3">
                    <button onClick={() => setActiveTab("result")} className={`rounded-xl px-4 py-2 font-semibold ${activeTab === "result" ? "bg-teal-600 text-white" : "text-[var(--content-muted)] hover:bg-[var(--surface-muted)]"}`}>ผลครั้งนี้</button>
                    <button onClick={() => setActiveTab("history")} className={`rounded-xl px-4 py-2 font-semibold ${activeTab === "history" ? "bg-teal-600 text-white" : "text-[var(--content-muted)] hover:bg-[var(--surface-muted)]"}`}>แนวโน้มและประวัติ</button>
                </div>

                {activeTab === "history" ? (
                    <div className="space-y-6">
                        <StudentStressTrendChart history={history} />
                        <section className="rounded-2xl border border-[var(--border)] p-5">
                            <h3 className="text-xl font-bold">ประวัติการประเมินล่าสุด</h3>
                            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[430px] text-sm"><thead className="border-b border-[var(--border)] text-left text-[var(--content-muted)]"><tr><th className="p-3">วันที่</th><th className="p-3 text-center">คะแนน</th><th className="p-3 text-center">ระดับ</th><th className="p-3 text-center">ชีพจร</th></tr></thead><tbody>{history.slice(0, 10).map((item) => <tr key={item.id} className="border-b border-[var(--border)]"><td className="p-3">{new Date(item.createdAt).toLocaleString("th-TH")}</td><td className="p-3 text-center font-semibold">{item.stressScore}%</td><td className="p-3 text-center">{stressLevelLabel(item.stressLevel)}</td><td className="p-3 text-center">{item.pulse?.bpm ?? "-"}</td></tr>)}</tbody></table></div>
                        </section>
                    </div>
                ) : <>

                <div className="grid gap-5 md:grid-cols-2">

                    <div className="rounded-xl border p-5">

                        <p className="text-[var(--content-muted)]">

                            คะแนนรวม

                        </p>

                        <h3 className="mt-2 text-4xl font-bold">

                            {data.stressScore}%

                        </h3>

                    </div>

                    <div className="rounded-xl border p-5">

                        <p className="text-[var(--content-muted)]">

                            ระดับความเครียด

                        </p>

                        <h3 className="mt-2 text-3xl font-bold">

                            {stressLevelLabel(data.stressLevel)}

                        </h3>

                    </div>

                    <div className="rounded-xl border p-5">

                        <div className="mb-3 flex items-center gap-2">

                            <HeartPulse />

                            ชีพจร

                        </div>

                        <h3 className="text-3xl font-bold">

                            {data.pulse?.bpm ?? "-"}

                        </h3>

                        <p>ครั้ง/นาที</p>

                    </div>

                </div>

                <div className="mt-8 rounded-xl border p-6">

                    <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">

                        <Brain />

                        สรุปผล

                    </h3>

                    <p>

                        {data.aiSummary}

                    </p>

                </div>

                <div className="mt-6 rounded-xl border p-6">

                    <h3 className="mb-3 text-xl font-bold">

                        คำแนะนำ

                    </h3>

                    <p>

                        {data.recommendation}

                    </p>

                </div>

                <div className="mt-6 rounded-xl border p-6">

                    <h3 className="mb-5 text-xl font-bold">

                        คะแนนแต่ละข้อ

                    </h3>

                    <ST5AnswerList answers={data.assessment.answers} />

                </div>

                </>}

            </div>

        </div>,
        document.body

    );

}
