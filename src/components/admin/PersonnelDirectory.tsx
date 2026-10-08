"use client";

import Link from "next/link";
import { Loader2, Pencil, Plus, Users } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";

type PersonnelRole = "ADVISOR" | "STAFF";

const copy = {
  ADVISOR: {
    title: "จัดการอาจารย์ที่ปรึกษา",
    description: "เพิ่ม แก้ไข และตรวจสอบจำนวนนิสิตในความดูแล",
    addLabel: "เพิ่มอาจารย์",
    roleLabel: "อาจารย์ที่ปรึกษา",
  },
  STAFF: {
    title: "จัดการเจ้าหน้าที่",
    description: "เพิ่ม แก้ไข และกำหนดสถานะการใช้งานของเจ้าหน้าที่",
    addLabel: "เพิ่มเจ้าหน้าที่",
    roleLabel: "เจ้าหน้าที่",
  },
} as const;

export default function PersonnelDirectory({ role }: { role: PersonnelRole }) {
  const { users, loading } = useAdminUsers();
  const content = copy[role];
  const personnel = users.filter((user) => user.role === role);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main className="admin-page wellness-page space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">{content.title}</h1>
          <p className="mt-1 text-sm text-[var(--content-muted)]">{content.description}</p>
        </div>
        <Link
          href={`/admin/users/create?role=${role}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} /> {content.addLabel}
        </Link>
      </header>

      <section className="admin-surface overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--border)] p-5">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <Users size={21} />
          </div>
          <div>
            <p className="text-sm text-[var(--content-muted)]">{content.roleLabel}ทั้งหมด</p>
            <p className="text-2xl font-bold">{personnel.length} คน</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[var(--surface-muted)] text-left text-sm text-[var(--content-muted)]">
              <tr>
                <th className="px-5 py-3">ชื่อ-นามสกุล</th>
                <th className="px-5 py-3">อีเมล</th>
                <th className="px-5 py-3">หลักสูตร</th>
                {role === "ADVISOR" && <th className="px-5 py-3 text-center">นิสิตในความดูแล</th>}
                <th className="px-5 py-3 text-center">สถานะ</th>
                <th className="px-5 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {personnel.length === 0 ? (
                <tr>
                  <td colSpan={role === "ADVISOR" ? 6 : 5} className="px-5 py-12 text-center text-[var(--content-muted)]">
                    ยังไม่มี{content.roleLabel}ในระบบ
                  </td>
                </tr>
              ) : personnel.map((person) => {
                const studentCount = users.filter(
                  (user) => user.role === "STUDENT" && user.advisorId === person.id
                ).length;

                return (
                  <tr key={person.id} className="border-t border-[var(--border)]">
                    <td className="px-5 py-4 font-medium">{person.fullname}</td>
                    <td className="px-5 py-4">{person.email}</td>
                    <td className="px-5 py-4">{person.major?.name ?? "-"}</td>
                    {role === "ADVISOR" && <td className="px-5 py-4 text-center">{studentCount} คน</td>}
                    <td className="px-5 py-4 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${person.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {person.status === "ACTIVE" ? "ใช้งาน" : "ระงับใช้งาน"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link href={role === "ADVISOR" ? `/admin/advisors/${person.id}` : `/admin/staff/${person.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-muted)]">
                        <Pencil size={15} /> แก้ไข
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-sm text-[var(--content-muted)]">
        {role === "ADVISOR" ? "กำหนดนิสิตให้อาจารย์ได้จากการแก้ไขข้อมูลนิสิต " : "ต้องการลบผู้ใช้หรือจัดการข้อมูลทุกบทบาท? "}
        <Link href="/admin/users" className="font-medium text-emerald-700 hover:underline">ไปที่หน้าจัดการผู้ใช้งาน</Link>
      </p>
    </main>
  );
}
