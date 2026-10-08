"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Activity } from "@/types/activity";

interface Props {
    open: boolean;
    initialData?: Activity | null;
    onClose: () => void;
    onSubmit: (data: ActivityFormData) => Promise<void>;
}

export interface ActivityFormData {
    title: string;
    description: string;
    duration: number;
    category: string;
    stressLevel: string;
    image?: string;
}

const EMPTY_FORM: ActivityFormData = {
    title: "",
    description: "",
    duration: 10,
    category: "RELAX",
    stressLevel: "LOW",
    image: "",
};

export default function ActivityForm({
    open,
    initialData,
    onClose,
    onSubmit,
}: Props) {

    const [form, setForm] =
        useState<ActivityFormData>(EMPTY_FORM);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {

        if (!open) return;

        if (initialData) {

            setForm({
                title: initialData.title,
                description: initialData.description,
                duration: initialData.duration,
                category: initialData.category,
                stressLevel: initialData.stressLevel,
                image: initialData.image ?? "",
            });
        } else {
            setForm(EMPTY_FORM);
        }

    }, [open, initialData]);
    if (!open) return null;
    async function submit() {
        try {
            setSaving(true);
            await onSubmit(form);
            onClose();
        } finally {
            setSaving(false);
        }
    }
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="theme-card max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl p-6">
                <h2 className="mb-6 text-2xl font-bold">
                    {initialData
                        ? "แก้ไขกิจกรรม"
                        : "เพิ่มกิจกรรม"}
                </h2>

                <div className="space-y-4">
                    <input
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)] placeholder:text-[var(--content-muted)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="ชื่อกิจกรรม"
                        value={form.title}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                title: e.target.value,
                            })
                        }
                    />
                    <textarea
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)] placeholder:text-[var(--content-muted)] focus:border-[var(--accent)] focus:outline-none"
                        rows={4}
                        placeholder="รายละเอียด"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value,
                            })
                        }
                    />
                    <input
                        type="number"
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)] placeholder:text-[var(--content-muted)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="ระยะเวลา"
                        value={form.duration}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                duration: Number(e.target.value),
                            })
                        }
                    />
                    <select
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)] placeholder:text-[var(--content-muted)] focus:border-[var(--accent)] focus:outline-none"
                        value={form.category}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                category: e.target.value,
                            })
                        }
                    >
                        <option value="RELAX">ผ่อนคลาย</option>
                        <option value="EXERCISE">ออกกำลังกาย</option>
                        <option value="MEDITATION">สมาธิ</option>
                        <option value="MUSIC">ดนตรี</option>
                        <option value="OTHER">อื่น ๆ</option>
                    </select>
                    <select
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[var(--content-text)] placeholder:text-[var(--content-muted)] focus:border-[var(--accent)] focus:outline-none"
                        value={form.stressLevel}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                stressLevel: e.target.value,
                            })
                        }
                    >
                        <option value="LOW">ความเครียดต่ำ</option>
                        <option value="MEDIUM">ความเครียดปานกลาง</option>
                        <option value="HIGH">ความเครียดสูง</option>
                    </select>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border px-5 py-2"
                    >
                        ยกเลิก
                    </button>
                    <button
                        disabled={saving}
                        onClick={submit}
                        className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white"
                    >
                        {saving
                            ? "กำลังบันทึก..."
                            : "บันทึก"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
