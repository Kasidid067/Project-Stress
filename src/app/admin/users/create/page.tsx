"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMajor } from "@/hooks/useMajor";
import { useAdvisor } from "../../../../hooks/useAdvisor";

const roles = [
  { value: "STUDENT", label: "นิสิต" },
  { value: "ADVISOR", label: "อาจารย์ที่ปรึกษา" },
  { value: "STAFF", label: "เจ้าหน้าที่" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
] as const;

export default function CreateUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const { majors } = useMajor();
  const { advisors } = useAdvisor();

  const [loading, setLoading] = useState(false);

  const isSuperAdmin =
    session?.user?.role === "ADMIN" &&
    (session.user as any)?.isSuperAdmin === true;

  const [form, setForm] = useState({
    studentId: "",
    fullname: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT",
    majorId: 1,
    trackId: "",
    advisorId: "",
  });

  const requestedRole = searchParams.get("role");
  const isStudent = form.role === "STUDENT";
  const needsMajor = form.role === "STUDENT" || form.role === "ADVISOR";
  const identifierLabel = isStudent ? "รหัสนิสิต" : "รหัสผู้ใช้งาน";

  useEffect(() => {
    if (requestedRole && ["STUDENT", "ADVISOR", "STAFF", "ADMIN"].includes(requestedRole)) {
      setForm((current) => ({ ...current, role: requestedRole }));
    }
  }, [requestedRole]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(
        "/api/admin/users/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            advisorId: form.advisorId
              ? Number(form.advisorId)
              : null,
            trackId: form.trackId ? Number(form.trackId) : null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "เพิ่มผู้ใช้ไม่สำเร็จ"
        );
        return;
      }

      toast.success("เพิ่มผู้ใช้สำเร็จ");

      router.push("/admin/users");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page wellness-page mx-auto max-w-3xl p-5 sm:p-8">
      <h1 className="mb-8 text-3xl font-bold text-green-700">
        เพิ่มผู้ใช้งาน
      </h1>

      <section className="mb-5 rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
        <p className="mb-3 font-semibold text-[var(--content-text)]">เลือกสิทธิ์ผู้ใช้งาน</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="เลือกสิทธิ์ผู้ใช้งาน">
          {roles.filter((item) => item.value !== "ADMIN" || isSuperAdmin).map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={form.role === item.value}
              onClick={() => setForm((current) => ({
                ...current,
                role: item.value,
                advisorId: item.value === "STUDENT" ? current.advisorId : "",
              }))}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${form.role === item.value ? "bg-emerald-500 text-white shadow" : "border border-[var(--border)] bg-[var(--surface)] hover:bg-emerald-50"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="admin-surface space-y-5 p-6 sm:p-8"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <label className="block">
          <span className="mb-2 block font-medium">
            {identifierLabel}
          </span>

          <input
            placeholder={`กรอก${identifierLabel}`}
            value={form.studentId}
            onChange={(e) =>
              setForm({
                ...form,
                studentId: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-medium">
            ชื่อ-นามสกุล
          </span>

          <input
            placeholder="กรอกชื่อ-นามสกุล"
            value={form.fullname}
            onChange={(e) =>
              setForm({
                ...form,
                fullname: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-medium">
            อีเมล
          </span>

          <input
            placeholder="กรอกอีเมล"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-medium">
            เบอร์โทรศัพท์
          </span>

          <input
            placeholder="กรอกเบอร์โทรศัพท์"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-medium">
            รหัสผ่าน
          </span>

          <input
            type="password"
            placeholder="กรอกรหัสผ่าน"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />
        </label>

        {needsMajor && <label className="block">
          <span className="mb-2 block font-medium">
            หลักสูตร
          </span>

          <select
            value={form.majorId}
            onChange={(e) =>
              setForm({
                ...form,
                majorId: Number(e.target.value),
                trackId: "",
              })
            }
            className="w-full rounded-xl border p-3"
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
        </label>}

        {isStudent && <label className="block">
          <span className="mb-2 block font-medium">วิชาเอก <span className="text-gray-400">(ไม่บังคับ)</span></span>
          <select value={form.trackId} onChange={(e) => setForm({ ...form, trackId: e.target.value })} className="w-full rounded-xl border p-3">
            <option value="">-- ยังไม่กำหนด --</option>
            {(majors.find((major) => major.id === form.majorId)?.tracks ?? []).map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
          </select>
        </label>}

        {isStudent && <label className="block">
          <span className="mb-2 block font-medium">
            อาจารย์ที่ปรึกษา
          </span>

          <select
            value={form.advisorId}
            onChange={(e) =>
              setForm({
                ...form,
                advisorId: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
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

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/users")
            }
            disabled={loading}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "กำลังบันทึก..."
              : "เพิ่มผู้ใช้งาน"}
          </button>
        </div>
      </form>
    </main>
  );
}
