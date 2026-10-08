"use client";

import { useMemo, useState } from "react";

import { Search } from "lucide-react";

import AssessmentHistoryTable
    from "@/components/assessment/AssessmentHistoryTable";

import AssessmentDetailDialog
    from "@/components/assessment/AssessmentDetailDialog";

import {
    useAssessmentHistory,
} from "@/hooks/useAssessmentHistory";

export default function AssessmentHistoryPage() {

    const {

        history,

        loading,

    } = useAssessmentHistory();

    const [

        keyword,

        setKeyword,

    ] = useState("");

    const [

        selected,

        setSelected,

    ] = useState<any>(null);

    const filtered =
        useMemo(() => {

            const key =
                keyword.toLowerCase();

            return history.filter((item) =>

                item.stressLevel
                    .toLowerCase()
                    .includes(key)

                ||

                item.recommendation
                    ?.toLowerCase()
                    .includes(key)

                ||

                item.aiSummary
                    ?.toLowerCase()
                    .includes(key)

            );

        }, [

            history,

            keyword,

        ]);

    return (

        <main className="wellness-page space-y-8 p-5 sm:p-8">

            <div>

                <h1 className="text-4xl font-bold text-green-700">

                    ประวัติการประเมิน

                </h1>

                <p className="mt-2 text-[var(--content-muted)]">

                    ประวัติการประเมินความเครียดทั้งหมด

                </p>

            </div>

            <div className="wellness-card p-5 sm:p-6">

                <div className="relative mb-6 max-w-md">

                    <Search

                        size={18}

                        className="absolute left-4 top-4 text-[var(--content-muted)]"

                    />

                    <input

                        value={keyword}

                        onChange={(e) =>

                            setKeyword(
                                e.target.value
                            )

                        }

                        placeholder="ค้นหา..."

                        className="wellness-input w-full py-3 pl-11 pr-4"

                    />

                </div>

                {

                    loading ?

                        (

                            <div className="py-20 text-center">

                                กำลังโหลด...

                            </div>

                        )

                        :

                        (

                            <AssessmentHistoryTable

                                history={filtered}

                                onView={setSelected}

                            />

                        )

                }

            </div>

            <AssessmentDetailDialog

                open={!!selected}

                data={selected}

                history={history}

                onClose={() =>

                    setSelected(null)

                }

            />

        </main>

    );

}
