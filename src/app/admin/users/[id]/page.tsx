"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { useAdminUser } from "../../../../hooks/useAdminUser";
import { updateUser } from "../../../../services/adminUserDetail.service";
import { useMajor } from "../../../../hooks/useMajor";
import { useAdvisor } from "../../../../hooks/useAdvisor";

type PersonnelRole = "ADVISOR" | "STAFF";

export function EditUserPage({
    expectedRole,
}: {
    expectedRole?: PersonnelRole;
}) {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const id = Number(params.id);

    const { user, loading } = useAdminUser(id);
    const { majors } = useMajor();
    const { advisors } = useAdvisor();

    const [form, setForm] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        role: "STUDENT",
        majorId: 1,
        advisorId: "",
        status: "ACTIVE",
    });

    /*
     * ==========================================
     * ตรวจสอบว่าเป็น Super Admin หรือไม่
     * ==========================================
     */

    const isSuperAdmin =
        session?.user?.role === "ADMIN" &&
        Boolean(
            (session.user as any)?.isSuperAdmin
        );

    /*
     * ==========================================
     * ตรวจสอบ User ที่กำลังแก้ไข
     *
     * ถ้าเป็น Super Admin
     * ห้าม Admin ปกติแก้ไข
     * ==========================================
     */

    const targetIsSuperAdmin = Boolean(
        (user as any)?.isSuperAdmin
    );

    const targetIsAdmin =
        user?.role === "ADMIN";

    const isOwnAccount =
        Number(session?.user?.id) === user?.id;

    const isOwnAdminAccount =
        targetIsAdmin && isOwnAccount;

    const cannotEditTarget =
        targetIsAdmin
            ? !isOwnAccount
            : !isSuperAdmin && targetIsSuperAdmin;

    const isPersonnelPage = Boolean(expectedRole);
    const isStudent = !expectedRole && form.role === "STUDENT";
    const needsMajor = form.role === "STUDENT" || form.role === "ADVISOR";
    const showPhone = needsMajor || targetIsAdmin;
    const pageTitle = expectedRole === "ADVISOR"
        ? "แก้ไขอาจารย์ที่ปรึกษา"
        : expectedRole === "STAFF"
            ? "แก้ไขเจ้าหน้าที่"
            : "แก้ไขผู้ใช้งาน";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!user) return;

        setForm({
            fullname: user.fullname,
            email: user.email,
            phone: user.phone ?? "",
            password: "",
            role: user.role,
            majorId: user.majorId,
            advisorId:
                user.advisorId?.toString() ?? "",
            status: user.status,
        });
    }, [user]);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        /*
         * ==========================================
         * ป้องกัน Admin ปกติแก้ไข Admin
         * ==========================================
         */

        if (cannotEditTarget) {
            toast.error(
                "คุณไม่มีสิทธิ์แก้ไขผู้ดูแลระบบ"
            );
            return;
        }

        /*
         * ==========================================
         * ป้องกัน Admin ปกติเปลี่ยน Role เป็น ADMIN
         * ==========================================
         */

        if (
            !isSuperAdmin &&
            form.role === "ADMIN"
        ) {
            toast.error(
                "คุณไม่มีสิทธิ์กำหนดสิทธิ์ผู้ดูแลระบบ"
            );
            return;
        }

        try {
            const { advisorId, ...formWithoutAdvisor } = form;

            await updateUser(id, {
                ...formWithoutAdvisor,
                ...(isStudent
                    ? {
                        advisorId: advisorId
                            ? Number(advisorId)
                            : null,
                    }
                    : {}),
            });

            toast.success("บันทึกสำเร็จ");

            router.refresh();
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        }
    }

    if (loading) {
        return <div>กำลังโหลด...</div>;
    }

    if (!user) {
        return <div>ไม่พบข้อมูล</div>;
    }

    if (expectedRole && user.role !== expectedRole) {
        return <div className="admin-surface m-8 p-8 text-center">ไม่พบข้อมูลผู้ใช้งานตามบทบาทที่เลือก</div>;
    }

    return (
        <main className="admin-page wellness-page mx-auto max-w-3xl p-5 sm:p-8">

            <h1 className="mb-8 text-3xl font-bold text-green-700">
                {pageTitle}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="admin-surface space-y-5 p-6 sm:p-8"
                style={{
                    boxShadow: "var(--shadow)",
                }}
            >

                <label className="block">
                    <span className="mb-2 block font-medium">
                        ชื่อ-นามสกุล
                    </span>

                    <input
                        className="w-full rounded-xl border p-3"
                        value={form.fullname}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                fullname:
                                    e.target.value,
                            })
                        }
                        placeholder="กรอกชื่อ-นามสกุล"
                        disabled={cannotEditTarget}
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block font-medium">
                        อีเมล
                    </span>

                    <input
                        className="w-full rounded-xl border p-3"
                        value={form.email}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                email: e.target.value,
                            })
                        }
                        placeholder="กรอกอีเมล"
                        disabled={cannotEditTarget}
                    />
                </label>

                {showPhone && <label className="block">
                    <span className="mb-2 block font-medium">
                        เบอร์โทรศัพท์
                    </span>

                    <input
                        className="w-full rounded-xl border p-3"
                        value={form.phone}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                phone: e.target.value,
                            })
                        }
                        placeholder="กรอกเบอร์โทรศัพท์"
                        disabled={cannotEditTarget}
                    />
                </label>}

                <label className="block">
                    <span className="mb-2 block font-medium">
                        หลักสูตร
                    </span>

                    <select
                        value={form.majorId}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                majorId: Number(
                                    e.target.value
                                ),
                            })
                        }
                        className="w-full rounded-xl border p-3"
                        disabled={cannotEditTarget || isOwnAdminAccount}
                    >
                        {majors.map((major) => (
                            <option
                                key={major.id}
                                value={major.id}
                            >
                                {major.name}
                            </option>
                        ))}
                    </select>
                </label>

                {!isPersonnelPage && <label className="block">
                    <span className="mb-2 block font-medium">
                        สิทธิ์ผู้ใช้งาน
                    </span>

                    <select
                        value={form.role}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                role: e.target.value,
                            })
                        }
                        className="w-full rounded-xl border p-3"
                        disabled={cannotEditTarget || isOwnAdminAccount}
                    >
                        <option value="STUDENT">
                            นิสิต
                        </option>

                        <option value="ADVISOR">
                            อาจารย์ที่ปรึกษา
                        </option>

                        <option value="STAFF">
                            เจ้าหน้าที่
                        </option>

                        {isSuperAdmin && (
                            <option value="ADMIN">
                                ผู้ดูแลระบบ
                            </option>
                        )}
                    </select>
                </label>}

                <label className="block">
                    <span className="mb-2 block font-medium">
                        สถานะผู้ใช้งาน
                    </span>

                    <select
                        value={form.status}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                status: e.target.value,
                            })
                        }
                        className="w-full rounded-xl border p-3"
                        disabled={cannotEditTarget || isOwnAdminAccount}
                    >
                        <option value="ACTIVE">
                            ใช้งาน
                        </option>

                        <option value="INACTIVE">
                            ระงับการใช้งาน
                        </option>
                    </select>
                </label>

                {isStudent && <label className="block">
                    <span className="mb-2 block font-medium">
                        อาจารย์ที่ปรึกษา
                    </span>

                    <select
                        value={form.advisorId}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                advisorId:
                                    e.target.value,
                            })
                        }
                        className="w-full rounded-xl border p-3"
                        disabled={cannotEditTarget}
                    >
                        <option value="">
                            -- ไม่มี --
                        </option>

                        {advisors.map((advisor) => (
                            <option
                                key={advisor.id}
                                value={advisor.id}
                            >
                                {advisor.fullname}
                            </option>
                        ))}
                    </select>
                </label>}

                <label className="block">
                    <span className="mb-2 block font-medium">
                        รหัสผ่านใหม่
                    </span>

                    <input
                        type="password"
                        className="w-full rounded-xl border p-3"
                        value={form.password}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password:
                                    e.target.value,
                            })
                        }
                        placeholder="เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน"
                        disabled={cannotEditTarget}
                    />
                </label>

                <div className="flex justify-end gap-3 pt-2">

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                expectedRole === "ADVISOR"
                                    ? "/admin/advisors"
                                    : expectedRole === "STAFF"
                                        ? "/admin/staff"
                                        : "/admin/users"
                            )
                        }
                        disabled={loading}
                        className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ยกเลิก
                    </button>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            cannotEditTarget
                        }
                        className="rounded-xl bg-green-600 px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        บันทึก
                    </button>

                </div>

            </form>
        </main>
    );
}

export default EditUserPage;
