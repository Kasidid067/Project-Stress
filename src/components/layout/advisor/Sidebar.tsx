"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap } from "lucide-react";

const menus = [
  {
    title: "แดชบอร์ด",
    href: "/advisor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "นิสิตในความดูแล",
    href: "/advisor/students",
    icon: GraduationCap,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="advisor-sidebar app-sidebar flex h-screen w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="app-sidebar-brand rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-lg">
        <h1 className="text-2xl font-bold">StressCare</h1>
        <p className="mt-1 text-sm text-white/80">ระบบอาจารย์ที่ปรึกษา</p>
      </div>

      <nav className="app-sidebar-nav mt-4 flex-1 space-y-2">
        {menus.map((menu) => {
          const active = pathname.startsWith(menu.href);
          const Icon = menu.icon;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              aria-current={active ? "page" : undefined}
              className={`app-sidebar-link flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-sky-500 text-white shadow"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <Icon size={20} />
              {menu.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
