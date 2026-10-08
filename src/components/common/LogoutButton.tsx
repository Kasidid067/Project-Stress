"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() =>
        signOut({
          callbackUrl: "/auth/login",
        })
      }
      aria-label="ออกจากระบบ"
      className="app-logout-button flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2.5 font-medium text-red-500 transition hover:bg-red-500 hover:text-white sm:px-4"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">ออกจากระบบ</span>
    </button>
  );
}
