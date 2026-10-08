import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  children: ReactNode;
}

export default function DashboardSection({
  title,
  children,
}: DashboardSectionProps) {
  return (
    <section className="wellness-card p-6 sm:p-7">

      <h2 className="mb-6 text-xl font-bold text-teal-800 dark:text-teal-200">
        {title}
      </h2>

      {children}

    </section>
  );
}
