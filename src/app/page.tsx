"use client";

import Link from "next/link";
import {
  HeartHandshake,
  Lock,
  UserPlus,
  ShieldCheck,
  Activity,
  ChartColumn,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-sky-50 to-rose-50 px-4 py-10 dark:from-slate-950 dark:via-teal-950/30 dark:to-slate-950">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_35%),radial-gradient(circle_at_bottom_right,#bae6fd,transparent_35%)]" />

      {/* Floating */}
      <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-green-200/40 blur-2xl" />
      <div className="absolute bottom-16 right-16 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur sm:p-10 dark:border-slate-700 dark:bg-slate-900/80">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <HeartHandshake
              size={42}
              className="text-green-600"
            />
          </div>

          <h1 className="text-5xl font-extrabold text-green-700">
            StressCare
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            ระบบประเมินความเครียดและแนะนำกิจกรรม
          </p>

        </div>

        <div className="rounded-2xl bg-green-50 p-6 text-center">

          <Lock
            className="mx-auto mb-4 text-green-600"
            size={42}
          />

          <h2 className="text-2xl font-bold text-green-700">
            กรุณาลงทะเบียน / เข้าสู่ระบบ
          </h2>

          <p className="mt-3 leading-7 text-gray-600">
            เพื่อเข้าใช้งานระบบประเมินความเครียด
            ดูประวัติการประเมิน
            และรับกิจกรรมที่เหมาะสมกับคุณ
          </p>

        </div>

        <div className="mt-8 space-y-4">

          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-4 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Lock size={22} />
            เข้าสู่ระบบ
          </Link>

          <Link
            href="/auth/register"
            className="flex items-center justify-center gap-3 rounded-2xl border-2 border-teal-500 py-4 text-lg font-semibold text-teal-700 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/30"
          >
            <UserPlus size={22} />
            ลงทะเบียน
          </Link>

        </div>

        <div className="mt-10 grid grid-cols-3 gap-5 text-center">

          <div>

            <ShieldCheck
              className="mx-auto mb-2 text-green-600"
              size={34}
            />

            <p className="font-semibold">
              ปลอดภัย
            </p>

            <p className="text-sm text-gray-500">
              ข้อมูลได้รับการปกป้อง
            </p>

          </div>

          <div>

            <Activity
              className="mx-auto mb-2 text-pink-500"
              size={34}
            />

            <p className="font-semibold">
              ประเมินง่าย
            </p>

            <p className="text-sm text-gray-500">
              ใช้งานสะดวก
            </p>

          </div>

          <div>

            <ChartColumn
              className="mx-auto mb-2 text-sky-500"
              size={34}
            />

            <p className="font-semibold">
              ติดตามผล
            </p>

            <p className="text-sm text-gray-500">
              ดูประวัติย้อนหลัง
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
