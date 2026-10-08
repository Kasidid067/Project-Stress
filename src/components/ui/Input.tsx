import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={`wellness-input w-full p-3 text-[var(--content-text)] placeholder:text-[var(--content-muted)] ${className}`}
    />
  );
}
