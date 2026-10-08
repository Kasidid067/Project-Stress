import type { ReactNode } from "react";

import { auth } from "@/auth";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/student/Sidebar";
import ThemeProvider from "@/components/providers/ThemeProvider";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Navbar
            name={session?.user?.name ?? undefined}
            role={session?.user?.role}
          />

          <main className="flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.45),_rgba(248,250,252,0.9))] p-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.8),_rgba(15,23,42,1))]">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}