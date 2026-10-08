"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
    Search,
    Pencil,
    Trash2,
    Plus,
    X,
} from "lucide-react";
import { useMajor } from "@/hooks/useMajor";
import {
    createMajor,
    updateMajor,
    deleteMajor,
    MajorDeleteError,
} from "@/services/major.service";

export default function MajorPage() {
    const { majors, loading } = useMajor();

    const [open, setOpen] = useState(false);

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [name, setName] = useState("");

    const [keyword, setKeyword] =
        useState("");

    const [trackMajor, setTrackMajor] = useState<any>(null);
    const [trackName, setTrackName] = useState("");

    const [deleteMajorData, setDeleteMajorData] =
        useState<any>(null);

    const [
        deleteStudentCount,
        setDeleteStudentCount,
    ] = useState<number>(0);

    const [
        confirmDeleteStudents,
        setConfirmDeleteStudents,
    ] = useState(false);

    const sortedMajors = useMemo(() => {
        return [...majors]
            .sort((a, b) => a.id - b.id)
            .filter((major) =>
                major.name
                    .toLowerCase()
                    .includes(
                        keyword.toLowerCase()
                    )
            );
    }, [majors, keyword]);

    async function handleSave() {
        try {
            if (editingId) {
                await updateMajor(
                    editingId,
                    {
                        name,
                    }
                );

                toast.success(
                    "แก้ไขหลักสูตรสำเร็จ"
                );
            } else {
                await createMajor({
                    name,
                });

                toast.success(
                    "เพิ่มหลักสูตรสำเร็จ"
                );
            }

            setOpen(false);
            setEditingId(null);
            setName("");

            window.location.reload();
        } catch (error) {
            if (
                error instanceof Error
            ) {
                toast.error(
                    error.message ||
                    "เกิดข้อผิดพลาด"
                );
            } else {
                toast.error(
                    "เกิดข้อผิดพลาด"
                );
            }
        }
    }

    async function handleDelete(
        id: number,
        forceDeleteStudents = false
    ) {
        try {
            await deleteMajor(
                id,
                forceDeleteStudents
            );

            toast.success(
                forceDeleteStudents
                    ? "ลบหลักสูตรและนิสิตที่อยู่ในหลักสูตรสำเร็จ"
                    : "ลบหลักสูตรสำเร็จ"
            );

            setDeleteMajorData(null);
            setDeleteStudentCount(0);
            setConfirmDeleteStudents(false);

            window.location.reload();
        } catch (error) {
            /*
             * มีนิสิตอยู่ในหลักสูตร
             */
            if (
                error instanceof
                MajorDeleteError
            ) {
                setDeleteStudentCount(
                    error.studentCount
                );

                setConfirmDeleteStudents(
                    true
                );

                return;
            }

            if (
                error instanceof Error
            ) {
                toast.error(
                    error.message ||
                    "ลบหลักสูตรไม่สำเร็จ"
                );
            } else {
                toast.error(
                    "ลบหลักสูตรไม่สำเร็จ"
                );
            }
        }
    }

    function closeDeleteModal() {
        setDeleteMajorData(null);
        setDeleteStudentCount(0);
        setConfirmDeleteStudents(false);
    }

    async function addTrack() {
        if (!trackMajor || !trackName.trim()) return;
        const response = await fetch(`/api/admin/majors/${trackMajor.id}/tracks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: trackName }) });
        const data = await response.json();
        if (!response.ok) return toast.error(data.message ?? "ไม่สามารถเพิ่มวิชาเอกได้");
        toast.success("เพิ่มวิชาเอกสำเร็จ");
        window.location.reload();
    }

    async function deleteTrack(trackId: number) {
        if (!confirm("ต้องการลบวิชาเอกนี้ใช่หรือไม่")) return;
        const response = await fetch(`/api/admin/major-tracks/${trackId}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) return toast.error(data.message ?? "ไม่สามารถลบวิชาเอกได้");
        toast.success("ลบวิชาเอกสำเร็จ");
        window.location.reload();
    }

    if (loading) {
        return (
            <div>
                กำลังโหลด...
            </div>
        );
    }

    return (
        <main className="admin-page wellness-page p-5 sm:p-8">
            <div className="mb-8 flex items-center justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-green-700">
                        จัดการหลักสูตร
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        เพิ่ม แก้ไข และลบข้อมูลหลักสูตร
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditingId(null);
                        setName("");
                        setOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
                >
                    <Plus size={18} />
                    เพิ่มหลักสูตร
                </button>
            </div>

            <div className="admin-surface relative mb-6 p-4">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(
                            e.target.value
                        )
                    }
                    placeholder="ค้นหาหลักสูตร..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 shadow"
                />
            </div>

            <div
                className="admin-surface overflow-hidden"
                style={{
                    boxShadow:
                        "var(--shadow)",
                }}
            >
                <table className="w-full">
                    <thead className="bg-green-300">
                        <tr>
                            <th className="p-4">
                                ID
                            </th>

                            <th>
                                ชื่อหลักสูตร
                            </th>

                            <th>วิชาเอก</th>

                            <th>
                                จัดการ
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedMajors.map(
                            (major) => (
                                <tr
                                    key={
                                        major.id
                                    }
                                    className="border-b"
                                >
                                    <td className="p-4">
                                        {
                                            major.id
                                        }
                                    </td>

                                    <td>
                                        {
                                            major.name
                                        }
                                    </td>

                                    <td className="max-w-sm py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {(major.tracks ?? []).length ? (major.tracks ?? []).map((track) => <span key={track.id} className="rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-800">{track.name}</span>) : <span className="text-sm text-gray-400">ยังไม่มี</span>}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex gap-3">

                                            <button onClick={() => { setTrackMajor(major); setTrackName(""); }} className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white transition hover:bg-teal-700">วิชาเอก</button>

                                            <button
                                                onClick={() => {
                                                    setEditingId(
                                                        major.id
                                                    );

                                                    setName(
                                                        major.name
                                                    );

                                                    setOpen(
                                                        true
                                                    );
                                                }}
                                                className="rounded-lg bg-blue-500 p-2 text-white transition hover:bg-blue-600"
                                            >
                                                <Pencil
                                                    size={
                                                        18
                                                    }
                                                />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setDeleteMajorData(
                                                        major
                                                    )
                                                }
                                                className="rounded-lg bg-red-500 p-2 text-white transition hover:bg-red-600"
                                            >
                                                <Trash2
                                                    size={
                                                        18
                                                    }
                                                />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {open && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                        className="w-96 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
                        style={{
                            boxShadow:
                                "var(--shadow)",
                        }}
                    >
                        <h2 className="mb-4 text-xl font-bold">
                            {editingId
                                ? "แก้ไขหลักสูตร"
                                : "เพิ่มหลักสูตร"}
                        </h2>

                        <input
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            className="mb-5 w-full rounded-xl border p-3"
                            placeholder="ชื่อหลักสูตร"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setOpen(
                                        false
                                    );

                                    setEditingId(
                                        null
                                    );

                                    setName("");
                                }}
                                className="rounded-xl border px-5 py-2"
                            >
                                ยกเลิก
                            </button>

                            <button
                                onClick={
                                    handleSave
                                }
                                className="rounded-xl bg-green-600 px-5 py-2 text-white"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}
            {deleteMajorData && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-red-600">
                                ลบหลักสูตร
                            </h2>

                            <button
                                onClick={
                                    closeDeleteModal
                                }
                            >
                                <X />
                            </button>
                        </div>

                        {!confirmDeleteStudents ? (
                            <>
                                <p className="text-gray-600">
                                    ต้องการลบหลักสูตร
                                </p>

                                <p className="mt-2 font-semibold">
                                    "{deleteMajorData.name}"
                                </p>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={
                                            closeDeleteModal
                                        }
                                        className="rounded-xl border px-5 py-2"
                                    >
                                        ยกเลิก
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                deleteMajorData.id
                                            )
                                        }
                                        className="rounded-xl bg-red-600 px-5 py-2 text-white"
                                    >
                                        ลบหลักสูตร
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="font-semibold text-red-600">
                                        ⚠️ พบว่ามีนิสิตอยู่ในหลักสูตรนี้
                                    </p>

                                    <p className="mt-3 text-gray-700">
                                        หลักสูตร
                                        <span className="font-semibold">
                                            {" "}
                                            "{deleteMajorData.name}"
                                        </span>
                                    </p>

                                    <p className="mt-2 text-gray-700">
                                        มีนิสิตจำนวน{" "}
                                        <span className="font-bold text-red-600">
                                            {deleteStudentCount}
                                        </span>{" "}
                                        คน
                                    </p>
                                </div>

                                <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                    <p className="font-semibold text-yellow-700">
                                        ⚠️ คำเตือน
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-gray-700">
                                        หากยืนยันการลบหลักสูตรนี้
                                        นิสิตที่อยู่ในหลักสูตรนี้ทั้งหมด
                                        จะถูกลบออกจากระบบด้วย
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-red-600">
                                        การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={
                                            closeDeleteModal
                                        }
                                        className="rounded-xl border px-5 py-2"
                                    >
                                        ยกเลิก
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                deleteMajorData.id,
                                                true
                                            )
                                        }
                                        className="rounded-xl bg-red-600 px-5 py-2 text-white"
                                    >
                                        ยืนยันลบหลักสูตรและนิสิต
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            , document.body)}

            {trackMajor && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">จัดการวิชาเอก</h2><p className="mt-1 text-sm text-[var(--content-muted)]">หลักสูตร: {trackMajor.name}</p></div><button onClick={() => setTrackMajor(null)} className="rounded-lg p-1 hover:bg-slate-100"><X size={20} /></button></div>
                        <div className="mt-5 flex gap-2"><input value={trackName} onChange={(event) => setTrackName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void addTrack(); }} placeholder="เช่น เอกดิจิทัล" className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2" /><button onClick={() => void addTrack()} className="rounded-xl bg-teal-600 px-4 font-semibold text-white">เพิ่ม</button></div>
                        <div className="mt-5 space-y-2">{(trackMajor.tracks ?? []).length ? (trackMajor.tracks ?? []).map((track: { id: number; name: string }) => <div key={track.id} className="flex items-center justify-between rounded-lg bg-[var(--surface-muted)] px-3 py-2"><span>{track.name}</span><button onClick={() => void deleteTrack(track.id)} className="text-sm font-semibold text-red-600">ลบ</button></div>) : <p className="text-sm text-[var(--content-muted)]">ยังไม่มีวิชาเอก</p>}</div>
                    </div>
                </div>
            , document.body)}
        </main>
    );
}
