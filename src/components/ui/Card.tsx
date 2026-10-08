import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export default function Card({
  children,
}: CardProps) {
  return (
    <div className="wellness-card p-6 sm:p-8">
      {children}
    </div>
  );
}
