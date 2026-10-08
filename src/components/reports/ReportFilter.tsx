"use client";

import { useEffect, useState } from "react";
import type { ReportFilter as Filter } from "@/types/reportFilter";
import type { Major } from "@/types/major";
import { getMajors } from "@/services/major.service";

interface Props {
    filter: Filter;
    setFilter: React.Dispatch<
        React.SetStateAction<Filter>
    >;
}

export default function ReportFilter({
    filter,
    setFilter,
}: Props) {
    const [majors, setMajors] = useState<Major[]>([]);
    useEffect(() => {
        async function loadMajors() {
            try {
                const data = await getMajors();
                setMajors(data);
            } catch (error) {
                console.error(error);
            }
        }
        loadMajors();
    }, []);
    return (
        <div className="theme-card rounded-2xl p-6">
            <h2 className="mb-4 text-xl font-semibold">
                ตัวกรองข้อมูล
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* หลักสูตร */}
                <select
                    value={filter.majorId ?? ""}
                    onChange={(e) =>
                        setFilter((prev) => ({
                            ...prev,
                            majorId: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                        }))
                    }
                    className="rounded-lg border p-3"
                >

                    <option value="">
                        ทุกหลักสูตร
                    </option>

                    {majors.map((major) => (

                        <option
                            key={major.id}
                            value={major.id}
                        >
                            {major.name}
                        </option>
                    ))}

                </select>

                {/* ระดับความเครียด */}
                <select
                    value={filter.stressLevel ?? ""}
                    onChange={(e) =>
                        setFilter((prev) => ({
                            ...prev,
                            stressLevel:
                                e.target.value || undefined,
                        }))
                    }
                    className="rounded-lg border p-3"
                >

                    <option value="">
                        ทุกระดับ
                    </option>

                    <option value="LOW">
                        ต่ำ
                    </option>

                    <option value="MEDIUM">
                        ปานกลาง
                    </option>

                    <option value="HIGH">
                        สูง
                    </option>

                </select>

                {/* วันที่เริ่ม */}
                <input
                    type="date"
                    value={filter.startDate ?? ""}
                    onChange={(e) =>
                        setFilter((prev) => ({
                            ...prev,
                            startDate:
                                e.target.value || undefined,
                        }))
                    }
                    className="rounded-lg border p-3"
                />

                {/* วันที่สิ้นสุด */}
                <input
                    type="date"
                    value={filter.endDate ?? ""}
                    onChange={(e) =>
                        setFilter((prev) => ({
                            ...prev,
                            endDate:
                                e.target.value || undefined,
                        }))
                    }
                    className="rounded-lg border p-3"
                />


                <input
                    type="text"
                    placeholder="ค้นหาชื่อหรือรหัสนิสิต"

                    value={filter.search ?? ""}

                    onChange={(e) =>
                        setFilter((prev) => ({
                            ...prev,
                            search:
                                e.target.value || undefined,
                        }))
                    }

                    className="rounded-lg border p-3 md:col-span-4"
                />

            </div>

        </div>

    );

}
