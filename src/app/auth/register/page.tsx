"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GraduationCap, HeartPulse, IdCard, Lock, Mail, Phone, User } from "lucide-react";

interface Major { id: number; name: string; tracks?: { id: number; name: string }[]; }
const inputClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 pl-11 text-[var(--content-text)] focus:border-[var(--accent)] focus:outline-none";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [majors, setMajors] = useState<Major[]>([]);
  const [form, setForm] = useState({ studentId: "", fullname: "", phone: "", email: "", majorId: 0, trackId: 0, password: "", confirmPassword: "" });

  useEffect(() => {
    fetch("/api/admin/majors").then((response) => response.json()).then((data) => setMajors(Array.isArray(data) ? data : [])).catch(() => toast.error("ไม่สามารถโหลดข้อมูลหลักสูตรได้"));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.studentId || !form.fullname || !form.phone || !form.email || !form.password || !form.confirmPassword || form.majorId === 0) { toast.warning("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (!/^\d{1,10}$/.test(form.studentId)) { toast.error("รหัสนิสิตต้องเป็นตัวเลขและมีความยาวไม่เกิน 10 หลัก"); return; }
    if (!/^\d{10}$/.test(form.phone)) { toast.error("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก"); return; }
    if (!/^[^\s@]+@tsu\.ac\.th$/i.test(form.email)) { toast.error("กรุณาใช้อีเมลมหาวิทยาลัยที่ลงท้ายด้วย @tsu.ac.th"); return; }
    if (form.password !== form.confirmPassword) { toast.error("รหัสผ่านไม่ตรงกัน"); return; }
    try {
      setLoading(true);
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: form.studentId, fullname: form.fullname, phone: form.phone, email: form.email, majorId: form.majorId, trackId: form.trackId || null, password: form.password }) });
      const data = await response.json();
      if (!response.ok) { toast.error(data.message || "ไม่สามารถสมัครสมาชิกได้"); return; }
      toast.success("สมัครสมาชิกสำเร็จ");
      router.push("/auth/login");
    } catch { toast.error("เกิดข้อผิดพลาดในระบบ"); } finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.45),_rgba(248,250,252,0.9))] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.8),_rgba(15,23,42,1))]"><div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-[var(--surface)] p-6 shadow-2xl sm:p-8" style={{ boxShadow: "var(--shadow)" }}>
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 shadow-lg"><HeartPulse className="h-8 w-8 text-white" /></div>
    <h1 className="mt-4 text-center text-3xl font-bold text-[var(--accent-strong)]">StressCare</h1><p className="mt-2 text-center text-[var(--content-muted)]">สมัครสมาชิก</p>
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Field label="รหัสนิสิต" required><IdCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><input type="text" inputMode="numeric" maxLength={10} pattern="[0-9]*" required placeholder="เช่น 662021067" value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputClass} /></Field>
      <Field label="ชื่อ-นามสกุล" required hint="ไม่ต้องใส่คำนำหน้า เช่น สมชาย ใจดี"><User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><input type="text" required placeholder="เช่น สมชาย ใจดี" value={form.fullname} onChange={(event) => setForm({ ...form, fullname: event.target.value })} className={inputClass} /></Field>
      <Field label="เบอร์โทรศัพท์" required><Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><input type="tel" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" required placeholder="ตัวเลข 10 หลัก" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputClass} /></Field>
      <Field label="หลักสูตร" required><GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><select required value={form.majorId} onChange={(event) => setForm({ ...form, majorId: Number(event.target.value), trackId: 0 })} className={inputClass}><option value={0}>เลือกหลักสูตร</option>{majors.map((major) => <option key={major.id} value={major.id}>{major.name}</option>)}</select></Field>
      <Field label="วิชาเอก"><GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><select value={form.trackId} onChange={(event) => setForm({ ...form, trackId: Number(event.target.value) })} disabled={!form.majorId} className={inputClass}><option value={0}>ยังไม่กำหนด</option>{(majors.find((major) => major.id === form.majorId)?.tracks ?? []).map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}</select></Field>
      <Field label="อีเมลมหาวิทยาลัย" required hint="ต้องลงท้ายด้วย @tsu.ac.th"><Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><input type="email" required placeholder="ชื่อผู้ใช้@tsu.ac.th" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value.trim() })} className={inputClass} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="รหัสผ่าน" required><Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><input type="password" required placeholder="กรอกรหัสผ่าน" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={inputClass} /></Field><Field label="ยืนยันรหัสผ่าน" required><Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--content-muted)]" /><input type="password" required placeholder="กรอกรหัสผ่านอีกครั้ง" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} className={inputClass} /></Field></div>
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-[var(--accent)] py-3 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}</button>
    </form>
    <div className="mt-6 text-center text-sm text-[var(--content-muted)]">มีบัญชีผู้ใช้งานแล้ว? <Link href="/auth/login" className="ml-2 font-semibold text-[var(--accent-strong)] hover:underline">เข้าสู่ระบบ</Link></div>
  </div></main>;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[var(--content-text)]">{label}{required && <span className="ml-1 text-rose-500">*</span>}{hint && <span className="ml-2 text-xs font-normal text-[var(--content-muted)]">{hint}</span>}<span className="relative mt-1.5 block">{children}</span></label>;
}
