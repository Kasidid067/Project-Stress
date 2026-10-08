"use client";

import type { Activity } from "@/types/activity";
import { createPortal } from "react-dom";

interface Props {
    open: boolean;
    activity: Activity | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function DeleteActivityDialog({
    open,
    activity,
    onClose,
    onConfirm,
}: Props) {
    if (!open || !activity) return null;
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="theme-card w-full max-w-md rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-red-600">
                    ลบกิจกรรม
                </h2>

                <p className="mt-4 text-[var(--content-muted)]">
                    ต้องการลบกิจกรรม
                </p>

                <p className="mt-2 font-semibold">
                    "{activity.title}"
                </p>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border px-5 py-2"
                    >
                        ยกเลิก
                    </button>

                    <button
                        onClick={() => {
                            void onConfirm();
                        }}
                        className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white"
                    >
                        ลบกิจกรรม
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
