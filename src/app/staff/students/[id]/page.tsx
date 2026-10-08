"use client";

import { useParams } from "next/navigation";

import { useStaffStudent } from "@/hooks/useStaffStudent";
import { stressLevelLabel } from "@/lib/displayLabels";
import RiskFollowUpPanel from "@/components/risk/RiskFollowUpPanel";

export default function StaffStudentDetailPage() {

    const params = useParams();

    const id = Number(params.id);

    const {
        student,
        loading,
    } = useStaffStudent(id);

    if (loading) {

        return (
            <div className="p-8">
                กำลังโหลด...
            </div>
        );

    }

    if (!student) {

        return (
            <div className="p-8">
                ไม่พบข้อมูล
            </div>
        );

    }

    return (

        <main className="staff-page mx-auto max-w-6xl space-y-6 p-2 sm:p-4">

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}>

                <h1 className="text-3xl font-bold text-green-700">
                    {student.fullname}
                </h1>

                <div className="mt-4 space-y-2">

                    <p>รหัสนิสิต : {student.studentId}</p>

                    <p>อีเมล : {student.email}</p>

                    <p>เบอร์โทร : {student.phone ?? "-"}</p>

                    <p>หลักสูตร : {student.major.name}</p>


                    <p>
                        อาจารย์ที่ปรึกษา :
                        {" "}
                        {student.advisor?.fullname ?? "-"}
                    </p>

                </div>

            </div>

            <RiskFollowUpPanel studentId={student.id} />

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}>

                <h2 className="mb-4 text-2xl font-bold">
                    ชีพจรล่าสุด
                </h2>

                <p className="text-4xl font-bold text-red-500">
                    {student.pulses[0]?.bpm ?? "-"} ครั้ง/นาที
                </p>

            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow" style={{ boxShadow: "var(--shadow)" }}>

                <h2 className="mb-4 text-2xl font-bold">
                    ประวัติผล ST-5
                </h2>

                <div className="space-y-4">

                    {student.results.map((result) => (

                        <div
                            key={result.id}
                            className="rounded-lg border p-4"
                        >

                            <div className="flex justify-between">

                                <div>

                                    คะแนน :
                                    {" "}
                                    {result.stressScore}%

                                </div>

                                <div>

                                    {stressLevelLabel(result.stressLevel)}

                                </div>

                            </div>

                            {result.recommendation && (

                                <p className="mt-3 text-[var(--content-muted)]">

                                    {result.recommendation}

                                </p>

                            )}

                        </div>

                    ))}

                </div>

            </div>

        </main>

    );

}
