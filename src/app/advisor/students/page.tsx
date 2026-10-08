"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    Loader2,
    Search,
    Eye,
} from "lucide-react";
import TablePagination from "@/components/common/TablePagination";

interface Student {
    id: number;
    studentId: string;
    fullname: string;
    email: string;

    major: {
        id: number;
        name: string;
    };

    latestResult: {
        score: number;
        level: "LOW" | "MEDIUM" | "HIGH";
        bpm: number | null;
        createdAt: string;
    } | null;
}

interface Major {
    id: number;
    name: string;
}

export default function AdvisorStudentsPage() {

    const [loading, setLoading] = useState(true);

    const [students, setStudents] = useState<Student[]>([]);

    const [majors, setMajors] = useState<Major[]>([]);

    const [keyword, setKeyword] = useState("");

    const [majorId, setMajorId] = useState("ALL");

    const [stressLevel, setStressLevel] = useState("ALL");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    async function loadStudents() {

        setLoading(true);

        try {

            const params = new URLSearchParams();

            if (keyword)
                params.append("keyword", keyword);

            if (majorId !== "ALL")
                params.append(
                    "majorId",
                    majorId
                );

            if (stressLevel !== "ALL")
                params.append(
                    "stressLevel",
                    stressLevel
                );

            const res = await fetch(
                `/api/advisor/students?${params.toString()}`
            );

            const data = await res.json();

            setStudents(data);

        } finally {

            setLoading(false);

        }
    }

    async function loadMajors() {

        try {

            const res = await fetch(
                "/api/majors"
            );

            const data = await res.json();

            setMajors(data);

        } catch {

            setMajors([]);

        }

    }

    useEffect(() => {

        loadMajors();

    }, []);

    useEffect(() => {

        loadStudents();

    }, [
        keyword,
        majorId,
        stressLevel,
    ]);

    const total = useMemo(() => {

        return students.length;

    }, [students]);
    const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleStudents = students.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    function badge(level: string) {
        switch (level) {
            case "LOW":
                return (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        ต่ำ
                    </span>
                );
            case "MEDIUM":
                return (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        ปานกลาง
                    </span>
                );
            default:
                return (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        สูง
                    </span>
                );
        }
    }
        return (
        <main className="advisor-page space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-green-700">
                        นิสิตในที่ปรึกษา
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        รายชื่อนิสิตที่อยู่ในความดูแลของคุณ
                    </p>

                </div>

                <div className="rounded-xl bg-green-100 px-5 py-3 text-center">

                    <p className="text-sm text-gray-600">
                        จำนวนนิสิต
                    </p>

                    <h2 className="text-2xl font-bold text-green-700">
                        {total}
                    </h2>

                </div>

            </div>

            {/* Filter */}

            <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow md:grid-cols-3">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                        placeholder="ค้นหาชื่อ รหัสนิสิต หรืออีเมล"
                        className="w-full rounded-xl border py-3 pl-11 pr-4"
                    />

                </div>

                <select
                    value={stressLevel}
                    onChange={(e) => {
                        setStressLevel(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-xl border p-3"
                >

                    <option value="ALL">
                        ทุกระดับความเครียด
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

            </div>

            {/* Table */}

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow">

                {loading ? (

                    <div className="flex h-72 items-center justify-center">

                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />

                    </div>

                ) : (

                    <table className="min-w-full">

                        <thead className="bg-green-50">

                            <tr>

                                <th className="px-4 py-3 text-left">
                                    รหัสนิสิต
                                </th>

                                <th className="px-4 py-3 text-left">
                                    ชื่อ
                                </th>

                                <th className="px-4 py-3 text-left">
                                    หลักสูตร
                                </th>

                                <th className="px-4 py-3 text-center">
                                    คะแนน
                                </th>

                                <th className="px-4 py-3 text-center">
                                    ระดับ
                                </th>

                                <th className="px-4 py-3 text-center">
                                    ชีพจร
                                </th>

                                <th className="px-4 py-3 text-center">
                                    จัดการ
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {students.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={8}
                                        className="py-12 text-center text-gray-500"
                                    >
                                        ไม่พบนิสิต
                                    </td>

                                </tr>

                            ) : (

                                visibleStudents.map((student) => (

                                    <tr
                                        key={student.id}
                                        className="border-t transition hover:bg-green-50"
                                    >

                                        <td className="px-4 py-4">
                                            {student.studentId}
                                        </td>

                                        <td className="px-4 py-4">

                                            <div className="font-medium">
                                                {student.fullname}
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                {student.email}
                                            </div>

                                        </td>

                                        <td className="px-4 py-4">
                                            {student.major.name}
                                        </td>
                                        <td className="text-center font-semibold">
                                            {student.latestResult?.score ?? "-"}
                                        </td>
                                        <td className="text-center">
                                            {student.latestResult
                                                ? badge(
                                                      student.latestResult.level
                                                  )
                                                : "-"}
                                        </td>
                                        <td className="text-center">
                                            {student.latestResult?.bpm ?? "-"}
                                        </td>
                                        <td>
                                            <div className="flex justify-center">
                                                <Link
                                                    href={`/advisor/students/${student.id}`}
                                                    className="rounded-lg bg-blue-500 p-2 text-white transition hover:bg-blue-600"
                                                >
                                                    <Eye
                                                        size={18}
                                                    />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {!loading && (
                <TablePagination
                    page={currentPage}
                    totalItems={students.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />
            )}
        </main>
    );
}
