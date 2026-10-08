"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProfile, updateProfile } from "@/services/profile.service";
import type { ProfileData } from "@/types/profile";

type SupportRequest = {
  id: number;
  type: "ADVISOR_CHANGE" | "PROFILE_CORRECTION";
  status: "PENDING" | "RESOLVED" | "REJECTED";
  details: string;
  response: string | null;
  createdAt: string;
};

const requestTypeLabel = {
  ADVISOR_CHANGE: "ขอเปลี่ยนอาจารย์ที่ปรึกษา",
  PROFILE_CORRECTION: "แจ้งข้อมูลส่วนตัวไม่ถูกต้อง",
};

const requestStatusLabel = {
  PENDING: "รอดำเนินการ",
  RESOLVED: "ดำเนินการแล้ว",
  REJECTED: "ไม่ได้รับการอนุมัติ",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [requestType, setRequestType] = useState<SupportRequest["type"]>("ADVISOR_CHANGE");
  const [requestDetails, setRequestDetails] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [data, requestResponse] = await Promise.all([
          getProfile(),
          fetch("/api/student/support-requests", { cache: "no-store" }),
        ]);

        setProfile(data);
        setFullname(data.fullname);
        setPhone(data.phone ?? "");
        if (requestResponse.ok) {
          const requestData = await requestResponse.json();
          setSupportRequests(requestData.requests ?? []);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave() {
    try {
      await updateProfile(fullname, phone);

      toast.success("บันทึกข้อมูลเรียบร้อย");

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              fullname,
              phone,
            }
          : prev
      );
    } catch {
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    }
  }

  async function submitSupportRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSendingRequest(true);
    try {
      const response = await fetch("/api/student/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: requestType, details: requestDetails }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message ?? "ไม่สามารถส่งคำขอได้");
        return;
      }
      setSupportRequests((current) => [data.supportRequest, ...current]);
      setRequestDetails("");
      toast.success("ส่งคำขอให้เจ้าหน้าที่ตรวจสอบแล้ว");
    } catch {
      toast.error("ไม่สามารถส่งคำขอได้");
    } finally {
      setSendingRequest(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <main className="wellness-page mx-auto max-w-3xl p-5 sm:p-8">

      <h1 className="mb-8 text-3xl font-bold text-teal-800 dark:text-teal-200">
        ข้อมูลส่วนตัว
      </h1>

      <section className="wellness-card space-y-5 p-6 sm:p-8">

        <div>
          <label className="font-semibold">
            รหัสนิสิต
          </label>

          <input
            value={profile.studentId}
            disabled
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)]"
          />
        </div>

        <div>
          <label className="font-semibold">
            ชื่อ-นามสกุล
          </label>

          <input
            value={fullname}
            onChange={(e) =>
              setFullname(e.target.value)
            }
            className="wellness-input mt-2 w-full p-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            อีเมล
          </label>

          <input
            value={profile.email}
            disabled
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)]"
          />
        </div>

        <div>
          <label className="font-semibold">
            เบอร์โทรศัพท์
          </label>

          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="wellness-input mt-2 w-full p-3"
          />
        </div>

        <div>

          <div>
            <label className="font-semibold">
              หลักสูตร
            </label>

            <input
              value={profile.major.name}
              disabled
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)]"
            />
          </div>

        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          บันทึกข้อมูล
        </button>

      </section>

      <section className="wellness-card mt-6 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl font-bold text-teal-800 dark:text-teal-200">อาจารย์ที่ปรึกษาและการติดต่อ</h2>
            <p className="mt-1 text-sm text-[var(--content-muted)]">หากข้อมูลไม่ถูกต้องหรืออยากเปลี่ยนอาจารย์ ให้ส่งคำขอเพื่อให้เจ้าหน้าที่ตรวจสอบ</p>
          </div>
          <span className="wellness-badge bg-sky-100 text-sky-700 dark:bg-sky-950/45 dark:text-sky-200">ติดต่อผ่านระบบ</span>
        </div>

        <div className="mt-5 rounded-2xl bg-sky-50 p-5 dark:bg-sky-950/25">
          {profile.advisor ? (
            <>
              <p className="text-sm text-[var(--content-muted)]">อาจารย์ที่ปรึกษาปัจจุบัน</p>
              <p className="mt-1 text-lg font-bold">{profile.advisor.fullname}</p>
              <p className="mt-1 text-sm text-[var(--content-muted)]">{profile.advisor.email}{profile.advisor.phone ? ` · ${profile.advisor.phone}` : ""}</p>
            </>
          ) : (
            <p className="font-medium text-[var(--content-text)]">ยังไม่ได้กำหนดอาจารย์ที่ปรึกษา คุณสามารถส่งคำขอให้เจ้าหน้าที่ช่วยตรวจสอบได้</p>
          )}
        </div>

        <form onSubmit={submitSupportRequest} className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="ประเภทคำขอ">
            {(Object.keys(requestTypeLabel) as SupportRequest["type"][]).map((type) => (
              <button key={type} type="button" role="radio" aria-checked={requestType === type} onClick={() => setRequestType(type)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${requestType === type ? "bg-teal-500 text-white" : "border border-[var(--border)] hover:bg-[var(--surface-muted)]"}`}>
                {requestTypeLabel[type]}
              </button>
            ))}
          </div>
          <textarea value={requestDetails} onChange={(e) => setRequestDetails(e.target.value)} minLength={10} maxLength={1000} required rows={4} placeholder="ระบุรายละเอียดที่ต้องการให้เจ้าหน้าที่ช่วยตรวจสอบ (อย่างน้อย 10 ตัวอักษร)" className="wellness-input w-full resize-none p-3" />
          <button type="submit" disabled={sendingRequest} className="rounded-2xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
            {sendingRequest ? "กำลังส่งคำขอ..." : "ส่งคำขอให้เจ้าหน้าที่"}
          </button>
        </form>

        {supportRequests.length > 0 && (
          <div className="mt-7 border-t border-[var(--border)] pt-6">
            <h3 className="font-bold">ประวัติคำขอ</h3>
            <div className="mt-3 space-y-3">
              {supportRequests.map((request) => (
                <article key={request.id} className="rounded-2xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{requestTypeLabel[request.type]}</p><span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === "PENDING" ? "bg-amber-100 text-amber-700" : request.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{requestStatusLabel[request.status]}</span></div>
                  <p className="mt-2 text-sm text-[var(--content-muted)]">{request.details}</p>
                  {request.response && <p className="mt-3 rounded-xl bg-[var(--surface-muted)] p-3 text-sm">คำตอบจากผู้ดูแล: {request.response}</p>}
                  <p className="mt-3 text-xs text-[var(--content-muted)]">ส่งเมื่อ {new Date(request.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

    </main>
  );
}
