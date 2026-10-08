"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Moon, Sun } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { roleLabel } from "@/lib/displayLabels";

type NavbarProps = {
    name?: string;
    role?: string;
};

type NotificationItem = {
    id: number;
    assessmentId: number | null;
    studentId?: number | null;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
};

export default function Navbar({
    name,
    role = "ผู้ใช้งาน",
}: NavbarProps) {
    const router = useRouter();

    const { theme, toggleTheme } = useTheme();

    const [notifications, setNotifications] = useState<
        NotificationItem[]
    >([]);

    const [unreadCount, setUnreadCount] = useState(0);

    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const notificationRef =
        useRef<HTMLDivElement>(null);

    const rawDisplayName =
        name && name.trim() !== ""
            ? name
            : "ผู้ใช้งาน";

    const displayName =
        rawDisplayName === "System Admin"
            ? "ผู้ดูแลระบบ"
            : rawDisplayName;

    const notificationEndpoint =
        role === "ADMIN"
            ? "/api/admin/notifications"
            : role === "STAFF"
                ? "/api/staff/notifications"
                : role === "ADVISOR"
                    ? "/api/advisor/notifications"
                    : "/api/student/notifications";

    /*
     * ==========================================
     * โหลด Notification
     * ==========================================
     */

    async function loadNotifications() {
        try {
            const res = await fetch(
                notificationEndpoint,
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            if (!res.ok) {
                return;
            }

            const data = await res.json();

            setNotifications(
                data.notifications ?? []
            );

            setUnreadCount(
                data.unreadCount ?? 0
            );
        } catch (error) {
            console.error(
                "Load notifications error:",
                error
            );
        }
    }

    /*
     * ==========================================
     * โหลดตอนเปิด Navbar
     * และตรวจสอบทุก 30 วินาที
     * ==========================================
     */

    useEffect(() => {
        loadNotifications();

        const timer = setInterval(() => {
            loadNotifications();
        }, 30000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    /*
     * ==========================================
     * ปิด Dropdown เมื่อคลิกด้านนอก
     * ==========================================
     */

    useEffect(() => {
        function handleClickOutside(
            event: MouseEvent
        ) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target as Node
                )
            ) {
                setNotificationOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /*
     * ==========================================
     * อ่าน Notification
     * ==========================================
     */

    async function markAsRead(
        notificationId: number
    ) {
        try {
            const res = await fetch(
                `${notificationEndpoint}/${notificationId}`,
                {
                    method: "PATCH",
                }
            );

            if (!res.ok) {
                return;
            }

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id ===
                        notificationId
                        ? {
                            ...notification,
                            isRead: true,
                        }
                        : notification
                )
            );

            setUnreadCount((current) =>
                Math.max(0, current - 1)
            );
        } catch (error) {
            console.error(
                "Mark notification as read error:",
                error
            );
        }
    }

    /*
     * ==========================================
     * จัดการเมื่อกด Notification
     * ==========================================
     */

    async function handleNotificationClick(
        notification: NotificationItem
    ) {
        /*
         * อ่าน Notification ก่อน
         */
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        /*
         * ถ้าเป็น Notification ที่เกี่ยวกับ
         * ผลการประเมิน และมี assessmentId
         * ให้ไปหน้าผลการประเมิน
         */
        if (
            notification.assessmentId !== null &&
            (
                notification.type ===
                "ASSESSMENT" ||
                notification.type ===
                "HIGH_STRESS"
            )
        ) {
            setNotificationOpen(false);

            router.push(
                role === "ADMIN"
                    ? `/admin/assessments/${notification.assessmentId}`
                    : role === "STAFF" && notification.studentId
                        ? `/staff/students/${notification.studentId}`
                        : role === "ADVISOR" && notification.studentId
                            ? `/advisor/students/${notification.studentId}`
                            : `/student/result/${notification.assessmentId}`
            );
        }
    }

    function formatNotificationDate(
        date: string
    ) {
        return new Date(
            date
        ).toLocaleString("th-TH", {
            dateStyle: "short",
            timeStyle: "short",
        });
    }

    return (
        <header className="app-navbar sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 px-3 py-3 backdrop-blur sm:px-5 sm:py-4 lg:px-6">
            <div className="app-navbar-inner flex min-w-0 items-center justify-between gap-2">

                {/* Logo */}
                <div>
                    <h1 className="text-xl font-bold text-[var(--accent-strong)] sm:text-2xl">
                        StressCare
                    </h1>

                    <p className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
                        ระบบดูแลสุขภาวะ
                    </p>
                </div>

                {/* Right */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

                    {/* Theme */}
                    <button
                        onClick={toggleTheme}
                        className="app-navbar-icon rounded-full border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 transition hover:scale-105"
                        aria-label="สลับธีมสี"
                    >
                        {theme === "dark" ? (
                            <Sun size={18} />
                        ) : (
                            <Moon size={18} />
                        )}
                    </button>

                    {/* Notification */}
                    <div
                        ref={notificationRef}
                        className="relative"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setNotificationOpen(
                                    (current) =>
                                        !current
                                )
                            }
                            className="app-navbar-icon relative rounded-full border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 transition hover:scale-105"
                            aria-label="การแจ้งเตือน"
                        >
                            <Bell size={18} />

                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}
                        </button>

                        {notificationOpen && (
                            <div className="app-notification-panel absolute right-0 mt-3 w-[calc(100vw-1.5rem)] max-w-96 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl sm:w-96">

                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                                    <div>
                                        <h2 className="font-bold text-[var(--content-text)]">
                                            การแจ้งเตือน
                                        </h2>

                                        <p className="mt-1 text-xs text-[var(--content-muted)]">
                                            {unreadCount > 0
                                                ? `มี ${unreadCount} รายการที่ยังไม่ได้อ่าน`
                                                : "ไม่มีการแจ้งเตือนใหม่"}
                                        </p>
                                    </div>

                                    <Bell
                                        size={20}
                                        className="text-[var(--accent-strong)]"
                                    />
                                </div>

                                {/* Notification List */}
                                <div className="max-h-[420px] overflow-y-auto">

                                    {notifications.length ===
                                        0 ? (
                                        <div className="px-5 py-10 text-center">
                                            <div className="mb-3 text-4xl">
                                                🔔
                                            </div>

                                            <p className="font-medium text-[var(--content-text)]">
                                                ยังไม่มีการแจ้งเตือน
                                            </p>

                                            <p className="mt-1 text-sm text-[var(--content-muted)]">
                                                เมื่อมีข้อมูลใหม่
                                                จะแสดงที่นี่
                                            </p>
                                        </div>
                                    ) : (
                                        notifications.map(
                                            (
                                                notification
                                            ) => (
                                                <button
                                                    key={
                                                        notification.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleNotificationClick(
                                                            notification
                                                        )
                                                    }
                                                    className={`w-full border-b border-[var(--border)] px-5 py-4 text-left transition hover:bg-[var(--surface-muted)] ${!notification.isRead
                                                            ? "bg-[var(--surface-muted)]"
                                                            : ""
                                                        }`}
                                                >
                                                    <div className="flex gap-3">

                                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg">
                                                            {notification.type ===
                                                                "HIGH_STRESS"
                                                                ? "⚠️"
                                                                : notification.type ===
                                                                    "ACTIVITY"
                                                                    ? "🎯"
                                                                    : "📋"}
                                                        </div>

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-start justify-between gap-2">
                                                                <p
                                                                    className={`text-sm ${!notification.isRead
                                                                            ? "font-bold"
                                                                            : "font-semibold"
                                                                        } text-[var(--content-text)]`}
                                                                >
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </p>

                                                                {!notification.isRead && (
                                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-sm leading-6 text-[var(--content-muted)]">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>

                                                            <p className="mt-2 text-xs text-[var(--content-muted)]">
                                                                {formatNotificationDate(
                                                                    notification.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>
                                                </button>
                                            )
                                        )
                                    )}

                                </div>
                            </div>
                        )}
                    </div>

                    {/* User */}
                    <div className="app-user-chip hidden items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 md:flex">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-base font-bold text-white">
                            {displayName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-semibold">
                                {displayName}
                            </p>

                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {roleLabel(role)}
                            </p>
                        </div>

                    </div>

                    {/* Logout */}
                    <LogoutButton />

                </div>
            </div>
        </header>
    );
}
