"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CircleCheckBig, CircleX, Heart, TimerReset } from "lucide-react";
import TablePagination from "@/components/common/TablePagination";
import { usePulse } from "@/hooks/usePulse";

type MeasurementStage = "idle" | "waiting" | "countdown" | "sending";

export default function PulsePage() {
    const {
        records,
        loading,
        savingManual,
        saveManual,
        refresh,
    } = usePulse();

    const [result, setResult] = useState<{ bpm: number; samples?: number[] } | null>(null);
    const [measurementId, setMeasurementId] = useState<number | null>(null);
    const [measurementMessage, setMeasurementMessage] = useState("");
    const [measurementSamples, setMeasurementSamples] = useState<number[]>([]);
    const [liveBpm, setLiveBpm] = useState<number | null>(null);
    const [showMeasurementConfirm, setShowMeasurementConfirm] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [measurementStage, setMeasurementStage] = useState<MeasurementStage>("idle");
    const [historyPage, setHistoryPage] = useState(1);
    const [measurementMode, setMeasurementMode] = useState<"sensor" | "manual">("sensor");
    const [deviceStatus, setDeviceStatus] = useState<{
        online: boolean;
        lastSeenAt: string | null;
    } | null>(null);
    const previousSampleCount = useRef(0);
    const measuring = measurementId !== null;
    const historyPageSize = 10;
    const historyTotalPages = Math.max(1, Math.ceil(records.length / historyPageSize));
    const currentHistoryPage = Math.min(historyPage, historyTotalPages);
    const visibleRecords = records.slice(
        (currentHistoryPage - 1) * historyPageSize,
        currentHistoryPage * historyPageSize
    );

    // ==========================================
    // ข้อมูลสำหรับการกรอกค่าด้วยตนเอง
    // ==========================================

    const [manualBpm, setManualBpm] = useState("");

    useEffect(() => {
        if (!measurementId) return;

        let cancelled = false;
        const checkMeasurement = async () => {
            try {
                const response = await fetch(`/api/student/pulse/measurement?id=${measurementId}`, { cache: "no-store" });
                const data = await response.json();
                if (cancelled || !response.ok) return;

                const samples = Array.isArray(data.samples)
                    ? data.samples.filter((value: unknown): value is number => typeof value === "number")
                    : [];
                setMeasurementSamples((currentSamples) => {
                    const unchanged = currentSamples.length === samples.length
                        && currentSamples.every((value, index) => value === samples[index]);
                    return unchanged ? currentSamples : samples;
                });

                if (data.status === "MEASURING" && measurementStage === "waiting") {
                    setCountdown(7);
                    setMeasurementStage("countdown");
                    setMeasurementMessage("เริ่มนับถอยหลังครั้งที่ 1 กรุณาวางนิ้วบนเซ็นเซอร์และอยู่นิ่ง");
                }
                if (data.status === "COMPLETED") {
                    setResult({
                        bpm: data.bpm,
                        samples,
                    });
                    setMeasurementMessage("บันทึกผลการวัดจากเครื่องเรียบร้อยแล้ว");
                    setMeasurementId(null);
                    setCountdown(0);
                    setMeasurementStage("idle");
                    void refresh();
                }
                if (data.status === "EXPIRED") {
                    setMeasurementMessage("หมดเวลารอเครื่องวัด กรุณากดเริ่มวัดใหม่");
                    setMeasurementId(null);
                    setCountdown(0);
                    setMeasurementStage("idle");
                }
            } catch {
                if (!cancelled) setMeasurementMessage("กำลังรอการเชื่อมต่อกับเครื่องวัด");
            }
        };

        void checkMeasurement();
        // อัปเดตตารางตัวอย่างให้เร็วหลังบอร์ดส่งค่าครั้งที่ 1 และ 2
        const timer = window.setInterval(checkMeasurement, 800);
        return () => { cancelled = true; window.clearInterval(timer); };
    }, [measurementId, measurementStage, refresh]);

    // ตรวจสถานะจากเวลาที่ ESP32 ติดต่อระบบล่าสุด ไม่ได้อาศัยเพียงสถานะคิวการวัด
    useEffect(() => {
        let cancelled = false;

        const checkDeviceStatus = async () => {
            try {
                const response = await fetch("/api/sensor/pulse/status", { cache: "no-store" });
                const data = await response.json();
                if (!cancelled && response.ok) {
                    setDeviceStatus({
                        online: Boolean(data.online),
                        lastSeenAt: typeof data.lastSeenAt === "string" ? data.lastSeenAt : null,
                    });
                }
            } catch {
                if (!cancelled) setDeviceStatus({ online: false, lastSeenAt: null });
            }
        };

        void checkDeviceStatus();
        const timer = window.setInterval(checkDeviceStatus, 5000);
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        const latestSample = measurementSamples.at(-1);
        if (!latestSample || !measuring) return;

        setLiveBpm(latestSample);
        const timer = window.setTimeout(() => setLiveBpm(null), 1500);
        return () => window.clearTimeout(timer);
    }, [measurementSamples, measuring]);

    // เมื่อบอร์ดส่งค่ารอบที่ 1 หรือ 2 ให้เริ่มนับรอบใหม่ และล้างเลขใหญ่
    // ตารางยังเก็บค่าเดิมไว้จนกว่าจะครบทั้ง 3 รอบ
    useEffect(() => {
        if (!measuring) {
            previousSampleCount.current = 0;
            return;
        }

        if (measurementSamples.length > previousSampleCount.current) {
            previousSampleCount.current = measurementSamples.length;
            if (measurementSamples.length < 3) {
                setLiveBpm(null);
                setCountdown(7);
                setMeasurementStage("countdown");
                setMeasurementMessage(`บันทึกค่าครั้งที่ ${measurementSamples.length} แล้ว กำลังเริ่มวัดครั้งที่ ${measurementSamples.length + 1}`);
            }
        }
    }, [measurementSamples, measuring]);

    useEffect(() => {
        if (!measuring || measurementStage !== "countdown" || countdown <= 0) return;

        const timer = window.setInterval(() => {
            setCountdown((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [countdown, measuring, measurementStage]);

    // เมื่อครบเวลาของรอบที่ 1 หรือ 2 ให้รอข้อมูลที่บอร์ดส่งกลับก่อน
    // แล้ว effect ด้านบนจะเริ่มนับถอยหลังของรอบถัดไปเอง
    useEffect(() => {
        if (!measuring || measurementStage !== "countdown" || countdown !== 0) return;

        const currentRound = Math.min(measurementSamples.length + 1, 3);
        setMeasurementStage("sending");
        setMeasurementMessage(`ครบเวลารอบที่ ${currentRound} ระบบกำลังวัดข้อมูลและส่งข้อมูล กรุณาเอานิ้วออกจากเซ็นเซอร์`);
    }, [countdown, measuring, measurementSamples.length, measurementStage]);

    useEffect(() => {
        setHistoryPage((page) => Math.min(page, historyTotalPages));
    }, [historyTotalPages]);

    // ==========================================
    // เริ่มวัดชีพจรจากระบบ
    // ==========================================

    async function startMeasure() {
        if (!deviceStatus?.online) {
            setShowMeasurementConfirm(false);
            setMeasurementMessage("อุปกรณ์วัดชีพจรยังไม่เชื่อมต่อ กรุณาตรวจสอบบอร์ดและ Wi‑Fi");
            return;
        }

        try {
            setShowMeasurementConfirm(false);
            setCountdown(0);
            setMeasurementStage("waiting");
            setResult(null);
            setMeasurementSamples([]);
            previousSampleCount.current = 0;
            setLiveBpm(null);
            setMeasurementMessage("กำลังส่งคำสั่งไปยังเครื่องวัด...");
            const response = await fetch("/api/student/pulse/measurement", { method: "POST" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "ไม่สามารถเริ่มการวัดได้");
            setMeasurementId(data.id);
            setMeasurementMessage("ส่งคำสั่งแล้ว กรุณาวางนิ้วบนเซ็นเซอร์และรอผล");
        } catch (error) {
            setCountdown(0);
            setMeasurementStage("idle");
            setMeasurementMessage(error instanceof Error ? error.message : "ไม่สามารถเริ่มการวัดได้");
        }
    }

    // ==========================================
    // บันทึกค่าชีพจรที่ผู้ใช้กรอกเอง
    // ==========================================

    async function handleManualSave() {
        const bpm = Number(manualBpm);

        // ตรวจสอบ BPM
        if (
            !Number.isInteger(bpm) ||
            bpm < 30 ||
            bpm > 220
        ) {
            alert(
                "กรุณากรอกค่า BPM ระหว่าง 30–220"
            );
            return;
        }

        try {
            const data = await saveManual(bpm);

            if (!data) return;

            setResult({
                bpm: data.bpm,
            });

            setManualBpm("");
        } catch (error: any) {
            alert(
                error?.response?.data?.message ||
                "ไม่สามารถบันทึกค่าชีพจรได้"
            );
        }
    }

    // ==========================================
    // สถานะชีพจร
    // ==========================================

    function getStatus(bpm: number) {
        if (bpm < 60)
            return {
                text: "ชีพจรต่ำ",
                color: "text-blue-600",
            };

        if (bpm <= 100)
            return {
                text: "ปกติ",
                color: "text-green-600",
            };

        if (bpm <= 120)
            return {
                text: "ค่อนข้างสูง",
                color: "text-yellow-600",
            };

        return {
            text: "สูงผิดปกติ",
            color: "text-red-600",
        };
    }

    // ==========================================
    // คำแนะนำ
    // ==========================================

    function getRecommendation(bpm: number) {
        if (bpm < 60)
            return {
                title: "ชีพจรต่ำกว่าปกติ",
                color: "border-blue-200 bg-blue-50",
                icon: "🔵",
                message:
                    "อัตราการเต้นของหัวใจต่ำกว่า 60 BPM ควรวัดในขณะพักอีกครั้ง หากยังต่ำและมีอาการเวียนศีรษะ เหนื่อยง่าย หรือหน้ามืด ควรปรึกษาแพทย์",
            };

        if (bpm <= 100)
            return {
                title: "อยู่ในเกณฑ์ปกติ",
                color: "border-green-200 bg-green-50",
                icon: "🟢",
                message:
                    "อัตราการเต้นของหัวใจอยู่ในช่วงปกติ (60–100 BPM) แนะนำให้พักผ่อนให้เพียงพอ ออกกำลังกายอย่างสม่ำเสมอ และตรวจวัดเป็นระยะ",
            };

        if (bpm <= 120)
            return {
                title: "ชีพจรค่อนข้างสูง",
                color: "border-yellow-200 bg-yellow-50",
                icon: "🟡",
                message:
                    "ควรนั่งพักประมาณ 5–10 นาที แล้ววัดซ้ำอีกครั้ง หากเพิ่งออกกำลังกายหรือดื่มกาแฟ ค่าที่สูงขึ้นอาจเกิดจากปัจจัยดังกล่าว",
            };

        return {
            title: "ชีพจรสูงผิดปกติ",
            color: "border-red-200 bg-red-50",
            icon: "🔴",
            message:
                "หากไม่ได้เกิดจากการออกกำลังกาย และยังวัดได้มากกว่า 120 BPM ติดต่อกัน หรือมีอาการใจสั่น แน่นหน้าอก หรือหายใจลำบาก ควรพบแพทย์ทันที",
        };
    }

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {
        return (
            <main className="flex h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-3 text-5xl">
                        ❤️
                    </div>

                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="wellness-page mx-auto max-w-5xl p-5 sm:p-8">

            <h1 className="mb-8 text-3xl font-bold text-green-700">
                วัดชีพจร
            </h1>

            <div
                className="wellness-card p-6 sm:p-8"
                style={{ boxShadow: "var(--shadow)" }}
            >
                <div className="flex flex-col items-center">
                    <div className="mb-8 grid w-full max-w-xl grid-cols-2 rounded-2xl bg-[var(--surface-muted)] p-1.5">
                        <button
                            type="button"
                            disabled={measuring}
                            onClick={() => setMeasurementMode("sensor")}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${measurementMode === "sensor" ? "bg-teal-600 text-white shadow-sm" : "text-[var(--content-muted)] hover:text-teal-700"}`}
                        >
                            วัดจากเซ็นเซอร์
                        </button>
                        <button
                            type="button"
                            disabled={measuring}
                            onClick={() => setMeasurementMode("manual")}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${measurementMode === "manual" ? "bg-teal-600 text-white shadow-sm" : "text-[var(--content-muted)] hover:text-teal-700"}`}
                        >
                            กรอกข้อมูล
                        </button>
                    </div>

                    {measurementMode === "sensor" && (
                        <>
                    <Heart
                        size={80}
                        className={`
                            mb-6
                            ${measuring
                                ? "animate-pulse text-red-500"
                                : "text-red-400"
                            }
                        `}
                    />

                    <div className="text-6xl font-bold">
                        {result?.bpm ?? liveBpm ?? "--"}
                    </div>

                    <div className="mt-2 text-lg text-[var(--content-muted)]">
                        BPM
                    </div>

                    <div
                        className={`mt-5 flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border px-4 py-3 text-center ${
                            deviceStatus === null
                                ? "border-slate-200 bg-slate-50 text-slate-600"
                                : deviceStatus.online
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-rose-200 bg-rose-50 text-rose-800"
                        }`}
                    >
                        {deviceStatus?.online ? (
                            <CircleCheckBig size={22} className="shrink-0" aria-hidden="true" />
                        ) : (
                            <CircleX size={22} className="shrink-0" aria-hidden="true" />
                        )}
                        <div>
                            <p className="font-semibold">
                                {deviceStatus === null
                                    ? "กำลังตรวจสอบสถานะอุปกรณ์..."
                                    : deviceStatus.online
                                        ? "อุปกรณ์วัดชีพจรเชื่อมต่อแล้ว"
                                        : "อุปกรณ์วัดชีพจรยังไม่เชื่อมต่อ"}
                            </p>
                            {deviceStatus?.lastSeenAt && (
                                <p className="mt-0.5 text-xs opacity-80">
                                    ตรวจพบล่าสุด {new Date(deviceStatus.lastSeenAt).toLocaleTimeString("th-TH")}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        disabled={measuring || !deviceStatus?.online}
                        onClick={() => setShowMeasurementConfirm(true)}
                        className="mt-8 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3 font-semibold text-white shadow-sm hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {measuring
                            ? "กำลังรอเครื่องวัด..."
                            : deviceStatus?.online
                                ? "เริ่มวัดชีพจร"
                                : "รออุปกรณ์เชื่อมต่อ"}
                    </button>
                    <p className="mt-4 min-h-6 text-center text-sm text-[var(--content-muted)]">
                        {measurementMessage || "กดเริ่มวัด แล้ววางนิ้วบนเซ็นเซอร์ XD-58C"}
                    </p>
                    {measuring && (
                        <div className="mt-4 flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-center text-teal-800">
                            <TimerReset size={22} className="shrink-0" />
                            <div>
                                <p className="font-semibold">
                                    กำลังวัดครั้งที่ {Math.min(measurementSamples.length + 1, 3)}/3
                                </p>
                                {measurementStage === "countdown" && countdown > 0 ? (
                                    <>
                                        <p className="mt-1 text-sm">กรุณาวางนิ้วให้นิ่ง</p>
                                        <p className="mt-1 text-7xl font-black leading-none tabular-nums text-teal-700 sm:text-8xl" aria-label={`เหลือ ${countdown} วินาที`}>
                                            {countdown}
                                        </p>
                                        <p className="mt-1 text-sm">วินาทีก่อนเก็บค่า</p>
                                    </>
                                ) : measurementStage === "sending" ? (
                                    <p className="mt-1 text-sm font-semibold text-amber-700">
                                        ระบบกำลังวัดข้อมูลและส่งข้อมูล กรุณาเอานิ้วออกจากเซ็นเซอร์
                                    </p>
                                ) : (
                                    <p className="mt-1 text-sm">กำลังรอเครื่องวัดเริ่มรอบนี้...</p>
                                )}
                            </div>
                        </div>
                    )}
                    {(measuring || measurementSamples.length > 0) && (
                        <div className="mt-6 w-full max-w-xl overflow-hidden rounded-2xl border border-teal-100 bg-teal-50/70">
                            <div className="border-b border-teal-100 px-5 py-4">
                                <h2 className="font-bold text-teal-900">รายละเอียดการวัดจากเซ็นเซอร์</h2>
                                <p className="mt-1 text-sm text-teal-800">
                                    {measurementSamples.length > 0
                                        ? `ได้รับค่าแล้ว ${measurementSamples.length}/3 ครั้ง ระบบจะบันทึกค่าเฉลี่ยเมื่อครบ 3 ครั้ง`
                                        : "กำลังรอผลการวัดครั้งที่ 1..."}
                                </p>
                            </div>
                            <div className="grid grid-cols-4 divide-x divide-teal-100 text-center">
                                {Array.from({ length: 3 }, (_, index) => {
                                    const bpm = measurementSamples[index];
                                    return <div key={index} className="p-3">
                                        <p className="text-xs text-[var(--content-muted)]">ครั้งที่ {index + 1}</p>
                                        <p className="mt-1 text-lg font-bold text-teal-800">{bpm ?? "--"}</p>
                                        <p className="text-xs text-[var(--content-muted)]">BPM</p>
                                    </div>;
                                })}
                                <div className="bg-teal-100/70 p-3">
                                    <p className="text-xs font-semibold text-teal-800">ค่าเฉลี่ย</p>
                                    <p className="mt-1 text-lg font-bold text-teal-900">{result?.bpm ?? "--"}</p>
                                    <p className="text-xs text-teal-800">BPM</p>
                                </div>
                            </div>
                        </div>
                    )}
                        </>
                    )}
                    {/* ==========================================
                        กรอกค่าชีพจรด้วยตนเอง
                        ========================================== */}

                    {measurementMode === "manual" && (
                    <div className="w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-6">

                        <h2 className="mb-2 text-xl font-bold text-green-700">
                            กรอกค่าชีพจรด้วยตนเอง
                        </h2>

                        <p className="mb-6 text-sm text-[var(--content-muted)]">
                            สำหรับผู้ที่มีอุปกรณ์วัดชีพจรส่วนตัว
                            เช่น Apple Watch, Garmin หรืออุปกรณ์อื่น
                        </p>

                        <div className="space-y-4">

                            {/* BPM */}

                            <label className="block">
                                <span className="mb-2 block font-medium">
                                    ชีพจร (BPM)
                                </span>

                                <input
                                    type="number"
                                    min="30"
                                    max="220"
                                    value={manualBpm}
                                    onChange={(e) =>
                                        setManualBpm(
                                            e.target.value
                                        )
                                    }
                                    placeholder="เช่น 78"
                                    className="wellness-input w-full p-3"
                                />
                            </label>

                            {/* ปุ่มบันทึก */}

                            <button
                                type="button"
                                disabled={
                                    savingManual ||
                                    manualBpm.trim() === ""
                                }
                                onClick={handleManualSave}
                                className="w-full rounded-2xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 disabled:bg-slate-400"
                            >
                                {savingManual
                                    ? "กำลังบันทึก..."
                                    : "บันทึกค่าชีพจร"}
                            </button>

                        </div>
                    </div>

                    )}

                    {/* ==========================================
                        ผลการวัดล่าสุด
                        ========================================== */}

                    {result && (
                        <>
                            <div className="wellness-card mt-10 w-full bg-[var(--surface-muted)] p-6">

                                <h2 className="mb-6 text-2xl font-bold text-green-700">
                                    ผลการวัดล่าสุด
                                </h2>

                                <div className="grid gap-6 md:grid-cols-2">

                                    {/* BPM */}

                                    <div
                                        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
                                        style={{
                                            boxShadow:
                                                "var(--shadow)",
                                        }}
                                    >
                                        <p className="text-[var(--content-muted)]">
                                            ชีพจร
                                        </p>

                                        <h3 className="mt-2 text-4xl font-bold">
                                            {result.bpm}
                                        </h3>

                                        <p className="mt-1 text-[var(--content-muted)]">
                                            BPM
                                        </p>
                                    </div>

                                    {/* สถานะ */}

                                    <div
                                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow"
                                        style={{
                                            boxShadow:
                                                "var(--shadow)",
                                        }}
                                    >
                                        <p className="text-[var(--content-muted)]">
                                            สถานะ
                                        </p>

                                        <h3
                                            className={`mt-2 text-2xl font-bold ${getStatus(
                                                result.bpm
                                            ).color
                                                }`}
                                        >
                                            {
                                                getStatus(
                                                    result.bpm
                                                ).text
                                            }
                                        </h3>
                                    </div>

                                </div>
                            </div>

                            {/* ==========================================
                                คำแนะนำการแปลผลชีพจร
                                ========================================== */}

                            <div
                                className="wellness-card mt-8 w-full p-6"
                                style={{
                                    boxShadow:
                                        "var(--shadow)",
                                }}
                            >

                                <h2 className="mb-6 text-2xl font-bold text-green-700">
                                    📋 คำแนะนำการแปลผลชีพจร
                                </h2>

                                <div className="grid gap-6 lg:grid-cols-2">

                                    {/* เกณฑ์ */}

                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">

                                        <h3 className="mb-4 text-lg font-bold text-green-700">
                                            เกณฑ์การแปลผลอัตราการเต้นของหัวใจ
                                        </h3>

                                        <div className="space-y-3">

                                            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                                                <span className="font-semibold">
                                                    ต่ำกว่า 60 BPM
                                                </span>

                                                <span className="font-bold text-blue-600">
                                                    🔵 ชีพจรต่ำ
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                                                <span className="font-semibold">
                                                    60 – 100 BPM
                                                </span>

                                                <span className="font-bold text-green-600">
                                                    🟢 ปกติ
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
                                                <span className="font-semibold">
                                                    101 – 120 BPM
                                                </span>

                                                <span className="font-bold text-yellow-600">
                                                    🟡 ค่อนข้างสูง
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                                                <span className="font-semibold">
                                                    มากกว่า 120 BPM
                                                </span>

                                                <span className="font-bold text-red-600">
                                                    🔴 สูงผิดปกติ
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                    {/* วิธีวัด */}

                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">

                                        <h3 className="mb-4 text-lg font-bold text-green-700">
                                            วิธีวัดที่ถูกต้อง
                                        </h3>

                                        <ul className="space-y-3 text-sm leading-7 text-[var(--content)]">

                                            <li>
                                                ✅ ควรวัดในขณะพักอย่างน้อย 3 นาที
                                            </li>

                                            <li>
                                                ✅ นั่งนิ่งและผ่อนคลายก่อนเริ่มวัด
                                            </li>

                                            <li>
                                                ✅ งดออกกำลังกายก่อนวัดประมาณ 15–30 นาที
                                            </li>

                                            <li>
                                                ✅ หลีกเลี่ยงชา กาแฟ หรือเครื่องดื่มที่มีคาเฟอีน
                                            </li>

                                            <li>
                                                ✅ หากค่าผิดปกติควรวัดซ้ำอีกครั้ง
                                            </li>

                                        </ul>
                                    </div>

                                </div>

                                {/* ข้อเสนอแนะ */}

                                <div
                                    className={`mt-6 rounded-xl border p-5 ${getRecommendation(
                                        result.bpm
                                    ).color
                                        }`}
                                >

                                    <h3 className="mb-2 text-xl font-bold">

                                        {
                                            getRecommendation(
                                                result.bpm
                                            ).icon
                                        }{" "}

                                        {
                                            getRecommendation(
                                                result.bpm
                                            ).title
                                        }

                                    </h3>

                                    <p className="leading-7 text-slate-700">
                                        {
                                            getRecommendation(
                                                result.bpm
                                            ).message
                                        }
                                    </p>

                                </div>

                            </div>
                        </>
                    )}

                </div>
            </div>
            {/* ==========================================
                ประวัติการวัดชีพจร
                ========================================== */}

            <div
                className="wellness-card mt-10 p-6 sm:p-8"
                style={{
                    boxShadow: "var(--shadow)",
                }}
            >
                <h2 className="mb-6 text-2xl font-bold text-green-700">
                    ประวัติการวัดชีพจร
                </h2>

                {records.length === 0 ? (
                    <div className="py-12 text-center text-[var(--content-muted)]">
                        ยังไม่มีข้อมูลการวัดชีพจร
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b">
                            <tr>
                                <th className="p-4 text-left">
                                    วันที่
                                </th>

                                <th className="p-4 text-center">
                                    BPM
                                </th>

                                <th className="p-4 text-center">
                                    สถานะ
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {visibleRecords.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b"
                                >
                                    <td className="p-4">
                                        {new Date(
                                            record.recordedAt
                                        ).toLocaleString(
                                            "th-TH"
                                        )}
                                    </td>

                                    <td className="p-4 text-center font-semibold">
                                        {record.bpm}
                                    </td>

                                    <td
                                        className={`p-4 text-center font-semibold ${getStatus(
                                            record.bpm
                                        ).color
                                            }`}
                                    >
                                        {
                                            getStatus(
                                                record.bpm
                                            ).text
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <TablePagination
                    page={currentHistoryPage}
                    totalItems={records.length}
                    pageSize={historyPageSize}
                    onPageChange={setHistoryPage}
                />
            </div>
            {showMeasurementConfirm && typeof document !== "undefined" && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pulse-measurement-dialog-title"
                >
                    <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl sm:p-8">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                            <AlertCircle size={30} aria-hidden="true" />
                        </div>
                        <h2 id="pulse-measurement-dialog-title" className="text-xl font-bold text-[var(--content)]">
                            เตรียมพร้อมก่อนวัดชีพจร
                        </h2>
                        <p className="mt-3 leading-7 text-[var(--content-muted)]">
                            วางนิ้วบนเซ็นเซอร์ XD-58C ให้พอดีและอยู่นิ่ง ๆ อย่างน้อย 7 วินาที
                            ระบบจะเก็บค่าชีพจรที่ใช้ได้ 3 ครั้ง แล้วคำนวณค่าเฉลี่ยเพื่อบันทึกเพียง 1 ค่า
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--content-muted)]">
                            <li>นั่งพักก่อนวัด และหลีกเลี่ยงการขยับนิ้วหรือกดเซ็นเซอร์แรงเกินไป</li>
                            <li>รอจนกว่าระบบจะแจ้งผลการวัด ไม่ต้องกดปุ่มซ้ำ</li>
                        </ul>
                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowMeasurementConfirm(false)}
                                className="rounded-2xl border border-[var(--border)] px-5 py-3 font-semibold text-[var(--content)] hover:bg-[var(--surface-muted)]"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={startMeasure}
                                disabled={!deviceStatus?.online}
                                className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 font-semibold text-white shadow-sm hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                ยืนยันเริ่มวัด
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </main>
    );
}
