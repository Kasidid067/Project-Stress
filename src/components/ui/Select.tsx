import type { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}
export default function Select({
  children,
  className = "",
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
      className={`wellness-input w-full p-3 text-[var(--content-text)] ${className}`}
    >
      {children}
    </select>
  );
}
