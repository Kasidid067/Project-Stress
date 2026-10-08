"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAdvisor } from "@/hooks/useAdvisor";

type StudentRow = {
  rowNumber: number;
  studentId: string;
  fullname: string;
  email: string;
  phone: string;
  major: string;
  track: string;
  advisor: string;
  password: string;
};

const valueFrom = (row: Record<string, unknown>, keys: string[]) => {
  const key = Object.keys(row).find((column) => keys.includes(column.trim()));
  return key ? String(row[key] ?? "").trim() : "";
};

export default function ImportStudentsPage() {
  const router = useRouter();
  const { advisors } = useAdvisor();
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [advisorId, setAdvisorId] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const canImport = useMemo(
    () => rows.length > 0 && errors.length === 0 && rows.every((row) => row.studentId && row.fullname && row.email && row.major && (row.password || initialPassword.length >= 6)),
    [errors.length, initialPassword.length, rows],
  );

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      studentId: "6600000001", fullname: "ตัวอย่าง นิสิต", email: "student@tsu.ac.th", phone: "0812345678",
      major: "วิทยาการคอมพิวเตอร์", track: "", advisor: "", password: "",
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "นิสิต");
    XLSX.writeFile(workbook, "ตัวอย่างนำเข้าข้อมูลนิสิต.xlsx");
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sourceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      if (sourceRows.length === 0 || sourceRows.length > 500) {
        toast.error("ไฟล์ต้องมีข้อมูลตั้งแต่ 1 ถึง 500 รายการ");
        return;
      }
      const parsedRows = sourceRows.map((row, index): StudentRow => ({
        rowNumber: index + 2,
        studentId: valueFrom(row, ["studentId", "รหัสนิสิต"]),
        fullname: valueFrom(row, ["fullname", "ชื่อ-นามสกุล"]),
        email: valueFrom(row, ["email", "อีเมล"]),
        phone: valueFrom(row, ["phone", "โทรศัพท์", "เบอร์โทร"]),
        major: valueFrom(row, ["major", "หลักสูตร"]),
        track: valueFrom(row, ["track", "วิชาเอก"]),
        advisor: valueFrom(row, ["advisor", "อาจารย์ที่ปรึกษา"]),
        password: valueFrom(row, ["password", "รหัสผ่าน"]),
      }));
      const fileErrors: string[] = [];
      const studentIds = new Set<string>();
      const emails = new Set<string>();
      parsedRows.forEach((row) => {
        if (!row.studentId || !row.fullname || !row.email || !row.major) fileErrors.push(`แถว ${row.rowNumber}: ต้องมีรหัสนิสิต ชื่อ-นามสกุล อีเมล และหลักสูตร`);
        if (row.studentId && studentIds.has(row.studentId)) fileErrors.push(`แถว ${row.rowNumber}: รหัสนิสิตซ้ำในไฟล์`);
        if (row.email && emails.has(row.email.toLowerCase())) fileErrors.push(`แถว ${row.rowNumber}: อีเมลซ้ำในไฟล์`);
        studentIds.add(row.studentId);
        emails.add(row.email.toLowerCase());
      });
      setRows(parsedRows);
      setErrors(fileErrors);
      toast.success(`อ่านข้อมูลจากไฟล์แล้ว ${parsedRows.length} รายการ`);
    } catch {
      toast.error("ไม่สามารถอ่านไฟล์ตารางข้อมูลได้");
    }
  };

  const importStudents = async () => {
    if (!canImport) return;
    setIsImporting(true);
    try {
      const response = await fetch("/api/admin/users/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, advisorId: advisorId ? Number(advisorId) : null, initialPassword: initialPassword || null }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors ?? [result.message ?? "ไม่สามารถนำเข้าข้อมูลได้"]);
        toast.error(result.message ?? "ไม่สามารถนำเข้าข้อมูลได้");
        return;
      }
      toast.success(result.message);
      router.push("/admin/users");
      router.refresh();
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อระบบเพื่อนำเข้าข้อมูลได้");
    } finally {
      setIsImporting(false);
    }
  };

  return <main className="space-y-7">
    <section className="rounded-[2rem] border border-teal-200 bg-gradient-to-r from-teal-50 via-cyan-50 to-violet-50 px-8 py-7">
      <h1 className="text-3xl font-bold text-teal-800">นำเข้าข้อมูลนิสิต</h1>
      <p className="mt-2 text-slate-600">หลักสูตรต้องระบุในไฟล์ ส่วนอาจารย์ที่ปรึกษาและรหัสผ่านจะใช้จากไฟล์ก่อน หรือใช้ค่าเริ่มต้นด้านล่างเมื่อเว้นว่าง</p>
    </section>

    <section className="rounded-[2rem] border border-teal-100 bg-white p-7 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-slate-800">1. เตรียมไฟล์ตารางข้อมูล</h2><p className="mt-1 text-sm text-slate-500">รองรับ .xlsx และ .xls สูงสุด 500 รายการต่อครั้ง</p></div><button onClick={downloadTemplate} className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-300 px-4 py-3 font-semibold text-teal-700 hover:bg-teal-50"><Download size={18} /> ดาวน์โหลดไฟล์ตัวอย่าง</button></div>
      <label className="mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 px-6 text-center hover:bg-teal-50"><FileSpreadsheet className="mb-3 text-teal-600" size={40} /><span className="font-semibold text-slate-800">เลือกไฟล์ตารางข้อมูล (.xlsx, .xls)</span><span className="mt-1 text-sm text-slate-500">ต้องมี: รหัสนิสิต, ชื่อ-นามสกุล, อีเมล, หลักสูตร</span><span className="text-sm text-slate-500">เลือกใส่ได้: วิชาเอก, โทรศัพท์, อาจารย์ที่ปรึกษา, รหัสผ่าน</span><input className="hidden" type="file" accept=".xlsx,.xls" onChange={handleFile} /></label>
    </section>

    <section className="rounded-[2rem] border border-teal-100 bg-white p-7 shadow-sm"><h2 className="text-xl font-bold text-slate-800">2. กำหนดข้อมูลสำรอง</h2><p className="mt-1 text-sm text-slate-500">ใช้เฉพาะแถวที่เว้นข้อมูลนั้นไว้ในไฟล์</p><div className="mt-5 grid gap-5 md:grid-cols-2"><label className="space-y-2"><span className="font-medium text-slate-700">อาจารย์ที่ปรึกษา <span className="text-slate-400">(ไม่บังคับ)</span></span><select value={advisorId} onChange={(event) => setAdvisorId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"><option value="">ยังไม่กำหนด</option>{advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.fullname}</option>)}</select></label><label className="space-y-2"><span className="font-medium text-slate-700">รหัสผ่านเริ่มต้น <span className="text-slate-400">(ไม่บังคับ)</span></span><input value={initialPassword} onChange={(event) => setInitialPassword(event.target.value)} type="password" minLength={6} placeholder="อย่างน้อย 6 ตัวอักษร" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" /></label></div></section>

    {errors.length > 0 && <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p className="font-bold">กรุณาตรวจสอบข้อมูลก่อนนำเข้า</p><ul className="mt-2 list-disc space-y-1 pl-5">{errors.slice(0, 20).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul>{errors.length > 20 && <p className="mt-2">และอีก {errors.length - 20} รายการ</p>}</section>}

    {rows.length > 0 && <section className="overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-sm"><div className="flex items-center justify-between p-6"><h2 className="text-xl font-bold text-slate-800">ตัวอย่างข้อมูลที่จะนำเข้า</h2><span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">{rows.length} รายการ</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-teal-50 text-teal-800"><tr><th className="px-5 py-3">รหัสนิสิต</th><th className="px-5 py-3">ชื่อ-นามสกุล</th><th className="px-5 py-3">อีเมล</th><th className="px-5 py-3">หลักสูตร</th><th className="px-5 py-3">วิชาเอก</th><th className="px-5 py-3">อาจารย์ที่ปรึกษา</th><th className="px-5 py-3">รหัสผ่าน</th></tr></thead><tbody>{rows.slice(0, 10).map((row) => <tr key={row.rowNumber} className="border-t border-slate-100"><td className="px-5 py-3">{row.studentId}</td><td className="px-5 py-3">{row.fullname}</td><td className="px-5 py-3">{row.email}</td><td className="px-5 py-3">{row.major}</td><td className="px-5 py-3">{row.track || "-"}</td><td className="px-5 py-3">{row.advisor || (advisorId ? "ใช้ที่เลือก" : "ยังไม่กำหนด")}</td><td className="px-5 py-3">{row.password ? "จากไฟล์" : initialPassword ? "ใช้รหัสเริ่มต้น" : "ยังไม่ได้ระบุ"}</td></tr>)}</tbody></table></div>{rows.length > 10 && <p className="p-5 text-sm text-slate-500">แสดง 10 รายการแรกจากทั้งหมด {rows.length} รายการ</p>}</section>}

    <div className="flex justify-end"><button disabled={!canImport || isImporting} onClick={importStudents} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"><Upload size={18} />{isImporting ? "กำลังนำเข้าข้อมูล..." : "นำเข้าข้อมูลนิสิต"}</button></div>
  </main>;
}
