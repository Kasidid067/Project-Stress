"use client";

import Link from "next/link";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    X,
    UserRound,
    FileUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import TablePagination from "@/components/common/TablePagination";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useMajor } from "@/hooks/useMajor";
import { getAdvisorStudents } from "@/services/advisor.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { roleLabel, userStatusLabel } from "@/lib/displayLabels";

const roleTabs = [
    { value: "ALL", label: "ผู้ใช้งานทั้งหมด" },
    { value: "STUDENT", label: "นิสิต" },
    { value: "ADVISOR", label: "อาจารย์ที่ปรึกษา" },
    { value: "STAFF", label: "เจ้าหน้าที่" },
    { value: "ADMIN", label: "ผู้ดูแลระบบ" },
];

export default function UsersPage() {
    const { users, loading } = useAdminUsers();
    const { majors } = useMajor();
    const { data: session } = useSession();

    const [keyword, setKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [majorFilter, setMajorFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [deleteUser, setDeleteUser] =
        useState<any>(null);

    /*
     * ==========================================
     * Popup รายชื่อนิสิตของอาจารย์
     * ==========================================
     */

    const [selectedAdvisor, setSelectedAdvisor] =
        useState<any>(null);

    const [advisorStudents, setAdvisorStudents] =
        useState<any[]>([]);

    const [advisorStudentsLoading, setAdvisorStudentsLoading] =
        useState(false);

    const [advisorStudentsError, setAdvisorStudentsError] =
        useState<string | null>(null);

    const router = useRouter();

    /*
     * ==========================================
     * ตรวจสอบสิทธิ์ของผู้ที่กำลัง Login
     * ==========================================
     */

    const currentUserId = Number(
        session?.user?.id
    );

    const isSuperAdmin =
        session?.user?.role === "ADMIN" &&
        Boolean(
            (session.user as any)?.isSuperAdmin
        );

    /*
     * ==========================================
     * ตรวจสอบว่าสามารถแก้ไข User คนนี้หรือไม่
     * ==========================================
     */

    function canEditUser(user: any) {
        // ไม่มี Session
        if (!session?.user) {
            return false;
        }

        // บัญชีผู้ดูแลแก้ได้เฉพาะเจ้าของบัญชี
        // ใช้กฎเดียวกันกับ Super Admin เพื่อป้องกันการแก้ข้อมูลส่วนตัวกันเอง
        if (user.role === "ADMIN") {
            return Number(user.id) === currentUserId;
        }

        return true;
    }

    /*
     * ==========================================
     * ตรวจสอบว่าสามารถลบ User คนนี้หรือไม่
     * ==========================================
     */

    function canDeleteUser(user: any) {
        if (!session?.user) {
            return false;
        }

        // ห้ามลบตัวเอง
        if (
            Number(user.id) === currentUserId
        ) {
            return false;
        }

        // ห้ามลบ Super Admin
        if (user.isSuperAdmin === true) {
            return false;
        }

        // Admin ปกติห้ามลบ Admin
        if (
            !isSuperAdmin &&
            user.role === "ADMIN"
        ) {
            return false;
        }

        return true;
    }

    /*
     * ==========================================
     * เปิด Popup ดูนิสิตของอาจารย์
     * ==========================================
     */

    async function handleViewAdvisorStudents(
        advisor: any
    ) {
        setSelectedAdvisor(advisor);
        setAdvisorStudents([]);
        setAdvisorStudentsError(null);
        setAdvisorStudentsLoading(true);

        try {
            const data =
                await getAdvisorStudents(
                    Number(advisor.id)
                );

            setAdvisorStudents(
                data?.students ?? []
            );
        } catch (error: any) {
            console.error(
                "Load advisor students error:",
                error
            );

            const message =
                error?.response?.data?.message ||
                "ไม่สามารถโหลดข้อมูลนิสิตได้";

            setAdvisorStudentsError(message);

            toast.error(message);
        } finally {
            setAdvisorStudentsLoading(false);
        }
    }

    /*
     * ==========================================
     * ปิด Popup รายชื่อนิสิต
     * ==========================================
     */

    function closeAdvisorStudents() {
        setSelectedAdvisor(null);
        setAdvisorStudents([]);
        setAdvisorStudentsError(null);
        setAdvisorStudentsLoading(false);
    }

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const keywordMatch =
                user.fullname
                    .toLowerCase()
                    .includes(
                        keyword.toLowerCase()
                    ) ||
                user.email
                    .toLowerCase()
                    .includes(
                        keyword.toLowerCase()
                    ) ||
                user.studentId
                    .toLowerCase()
                    .includes(
                        keyword.toLowerCase()
                    );

            const roleMatch =
                roleFilter === "ALL" ||
                user.role === roleFilter;

            const majorMatch =
                !["STUDENT", "ADVISOR"].includes(roleFilter) ||
                majorFilter === "ALL" ||
                String(user.majorId) ===
                majorFilter;

            return (
                keywordMatch &&
                roleMatch &&
                majorMatch
            );
        });
    }, [
        users,
        keyword,
        roleFilter,
        majorFilter,
    ]);
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    async function handleDelete() {
        if (!deleteUser) return;

        /*
         * ==========================================
         * ตรวจสอบสิทธิ์อีกครั้งก่อนยิง API
         * ==========================================
         */

        if (!canDeleteUser(deleteUser)) {
            toast.error(
                "คุณไม่มีสิทธิ์ลบผู้ใช้งานนี้"
            );

            setDeleteUser(null);
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/users/${deleteUser.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(
                    data.message ||
                    "ลบไม่สำเร็จ"
                );

                return;
            }

            toast.success(
                "ลบผู้ใช้งานสำเร็จ"
            );

            setDeleteUser(null);

            router.refresh();
        } catch {
            toast.error(
                "เกิดข้อผิดพลาด"
            );
        }
    }

    return (
        <main className="admin-page wellness-page space-y-6">

            {/* Header */}

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-green-700">
                        จัดการผู้ใช้งาน
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        จัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link href="/admin/users/import" className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 font-medium text-teal-700 transition hover:bg-teal-100"><FileUp size={18} /> นำเข้าข้อมูล</Link>
                    <Link href="/admin/users/create" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"><Plus size={18} /> เพิ่มผู้ใช้งาน</Link>
                </div>

            </div>

            {/* ค้นหาและตัวกรอง */}

            <div className="admin-surface space-y-4 p-5">

                <div className="relative md:col-span-4">

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
                        placeholder="ค้นหาจากชื่อ รหัสนิสิต หรืออีเมล"
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 shadow"
                    />

                </div>

                <div className="flex flex-wrap gap-2" role="tablist" aria-label="เลือกประเภทผู้ใช้งาน">
                    {roleTabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={roleFilter === tab.value}
                            onClick={() => {
                                setRoleFilter(tab.value);
                                setMajorFilter("ALL");
                                setPage(1);
                            }}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${roleFilter === tab.value ? "bg-emerald-500 text-white shadow" : "border border-[var(--border)] bg-[var(--surface)] text-[var(--content-text)] hover:bg-emerald-50"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {["STUDENT", "ADVISOR"].includes(roleFilter) && (
                    <select
                        value={majorFilter}
                        onChange={(e) => {
                            setMajorFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full max-w-sm rounded-xl border p-3"
                        aria-label="เลือกหลักสูตร"
                    >
                        <option value="ALL">ทุกหลักสูตร</option>
                        {majors.map((major) => (
                            <option key={major.id} value={major.id}>{major.name}</option>
                        ))}
                    </select>
                )}

            </div>

            {/* Table */}

            <div className="admin-surface overflow-hidden">

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
                                สิทธิ์
                            </th>

                            <th className="px-4 py-3 text-left">
                                หลักสูตร
                            </th>

                            <th className="px-4 py-3 text-left">
                                สถานะ
                            </th>

                            <th className="px-4 py-3 text-center">
                                จัดการ
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        {filteredUsers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={6}
                                    className="py-12 text-center text-gray-500"
                                >
                                    ไม่พบข้อมูล
                                </td>

                            </tr>

                        ) : (

                            visibleUsers.map(
                                (user) => {

                                    const canEdit =
                                        canEditUser(
                                            user
                                        );

                                    const canDelete =
                                        canDeleteUser(
                                            user
                                        );

                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-t"
                                        >

                                            <td className="px-4 py-3">
                                                {user.studentId}
                                            </td>

                                            <td className="px-4 py-3">

                                                <div className="font-medium">
                                                    {user.fullname}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>

                                            </td>

                                            <td className="px-4 py-3">
                                                {roleLabel(user.role)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {["ADMIN", "STAFF"].includes(user.role)
                                                    ? "-"
                                                    : user.major?.name ?? "-"}
                                            </td>

                                            <td className="px-4 py-3">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status ===
                                                            "ACTIVE"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {userStatusLabel(user.status)}
                                                </span>

                                            </td>

                                            <td className="px-4 py-3">

                                                <div className="flex items-center justify-center gap-2">

                                                    {/* ==========================================
                                                        ปุ่มดูนิสิตที่ปรึกษา
                                                        แสดงเฉพาะ User ที่เป็น ADVISOR
                                                        ========================================== */}

                                                    {user.role ===
                                                        "ADVISOR" ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleViewAdvisorStudents(
                                                                        user
                                                                    )
                                                                }
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white transition hover:bg-green-600"
                                                                title="ดูนิสิตที่เป็นที่ปรึกษา"
                                                            >
                                                                <UserRound size={19} />
                                                            </button>
                                                        ) : null}

                                                    {/* ==========================================
                                                        ปุ่มแก้ไข
                                                        ========================================== */}

                                                    {canEdit ? (

                                                        <Link
                                                            href={
                                                                user.role === "ADVISOR"
                                                                    ? `/admin/advisors/${user.id}`
                                                                    : user.role === "STAFF"
                                                                        ? `/admin/staff/${user.id}`
                                                                        : `/admin/users/${user.id}`
                                                            }
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-600"
                                                            title="แก้ไขผู้ใช้งาน"
                                                        >
                                                            <Pencil
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </Link>

                                                    ) : (

                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-300 text-gray-500"
                                                            title="ไม่มีสิทธิ์แก้ไข"
                                                        >
                                                            <Pencil
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>

                                                    )}

                                                    {/* ==========================================
                                                        ปุ่มลบ
                                                        ========================================== */}

                                                    {canDelete ? (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteUser(
                                                                    user
                                                                )
                                                            }
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
                                                            title="ลบผู้ใช้งาน"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>

                                                    ) : (

                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-300 text-gray-500"
                                                            title={
                                                                Number(
                                                                    user.id
                                                                ) ===
                                                                    currentUserId
                                                                    ? "ไม่สามารถลบบัญชีตัวเองได้"
                                                                    : user.isSuperAdmin ===
                                                                        true
                                                                        ? "ไม่สามารถลบผู้ดูแลระดับสูงได้"
                                                                        : "ไม่มีสิทธิ์ลบ"
                                                            }
                                                        >
                                                            <Trash2
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )

                        )}

                    </tbody>

                </table>

                <div className="px-5 pb-5">
                    <TablePagination
                        page={currentPage}
                        totalItems={filteredUsers.length}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />
                </div>

            </div>

            {/* ==========================================
                Popup : รายชื่อนิสิตของอาจารย์
                ========================================== */}

            {selectedAdvisor && typeof document !== "undefined" && createPortal(

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeAdvisorStudents}
                >

                    <div
                        className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Header */}

                        <div className="mb-5 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-green-700">
                                    นิสิตที่อาจารย์เป็นที่ปรึกษา
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedAdvisor.fullname}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeAdvisorStudents
                                }
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={22} />
                            </button>

                        </div>

                        {/* Loading */}

                        {advisorStudentsLoading && (

                            <div className="flex min-h-[220px] items-center justify-center">

                                <div className="text-center">

                                    <Loader2
                                        className="mx-auto mb-3 h-8 w-8 animate-spin text-green-600"
                                    />

                                    <p className="text-gray-500">
                                        กำลังโหลดข้อมูลนิสิต...
                                    </p>

                                </div>

                            </div>

                        )}

                        {/* Error */}

                        {!advisorStudentsLoading &&
                            advisorStudentsError && (

                                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-red-600">

                                    {advisorStudentsError}

                                </div>

                            )}

                        {/* ไม่มีนิสิต */}

                        {!advisorStudentsLoading &&
                            !advisorStudentsError &&
                            advisorStudents.length ===
                            0 && (

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">

                                    <p className="text-lg font-medium">
                                        อาจารย์คนนี้ยังไม่มีนิสิตที่ปรึกษา
                                    </p>

                                    <p className="mt-1 text-sm">
                                        ยังไม่มีนิสิตที่ถูกกำหนดให้อาจารย์คนนี้เป็นที่ปรึกษา
                                    </p>

                                </div>

                            )}

                        {/* รายชื่อนิสิต */}

                        {!advisorStudentsLoading &&
                            !advisorStudentsError &&
                            advisorStudents.length >
                            0 && (

                                <div>

                                    <div className="mb-4 rounded-xl bg-green-50 p-4">

                                        <span className="font-semibold text-green-700">
                                            จำนวนนิสิตที่ปรึกษา
                                        </span>

                                        <span className="ml-2 text-xl font-bold text-green-700">
                                            {
                                                advisorStudents.length
                                            }{" "}
                                            คน
                                        </span>

                                    </div>

                                    <div className="max-h-[450px] overflow-auto rounded-xl border">

                                        <table className="min-w-full">

                                            <thead className="sticky top-0 bg-green-50">

                                                <tr>

                                                    <th className="px-4 py-3 text-left">
                                                        รหัสนิสิต
                                                    </th>

                                                    <th className="px-4 py-3 text-left">
                                                        ชื่อ-นามสกุล
                                                    </th>

                                                    <th className="px-4 py-3 text-left">
                                                        อีเมล
                                                    </th>

                                                    <th className="px-4 py-3 text-left">
                                                        หลักสูตร
                                                    </th>

                                                    <th className="px-4 py-3 text-center">
                                                        สถานะ
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {advisorStudents.map(
                                                    (
                                                        student
                                                    ) => (

                                                        <tr
                                                            key={
                                                                student.id
                                                            }
                                                            className="border-t"
                                                        >

                                                            <td className="px-4 py-3">
                                                                {
                                                                    student.studentId
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 font-medium">
                                                                {
                                                                    student.fullname
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {
                                                                    student.email
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {
                                                                    student
                                                                        .major
                                                                        ?.name ??
                                                                    "-"
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-center">

                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${student.status ===
                                                                            "ACTIVE"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-red-100 text-red-700"
                                                                        }`}
                                                                >
                                                                    {
                                                                        userStatusLabel(student.status)
                                                                    }
                                                                </span>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            )}

                    </div>

                </div>

            , document.body)}
            {/* ==========================================
                Modal ยืนยันการลบ User
                ========================================== */}

            {deleteUser && typeof document !== "undefined" && createPortal(

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() =>
                        setDeleteUser(null)
                    }
                >

                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Icon */}

                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

                            <Trash2
                                size={28}
                                className="text-red-600"
                            />

                        </div>

                        {/* Title */}

                        <h2 className="text-center text-xl font-bold text-gray-800">
                            ยืนยันการลบผู้ใช้งาน
                        </h2>

                        {/* Message */}

                        <p className="mt-3 text-center text-gray-600">
                            คุณต้องการลบผู้ใช้งาน
                        </p>

                        <p className="mt-1 text-center font-semibold text-gray-800">
                            {deleteUser.fullname}
                        </p>

                        <p className="mt-3 text-center text-sm text-red-600">
                            การดำเนินการนี้ไม่สามารถย้อนกลับได้
                        </p>

                        {/* Buttons */}

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteUser(null)
                                }
                                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                                ยกเลิก
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
                            >
                                ยืนยันการลบ
                            </button>

                        </div>

                    </div>

                </div>

            , document.body)}

        </main>
    );
}
