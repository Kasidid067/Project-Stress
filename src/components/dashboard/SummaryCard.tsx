interface SummaryCardProps {
    title: string;
    value: number;
    icon?: React.ReactNode;
    color?: string;

}

export default function SummaryCard({
    title,
    value,
    icon,
    color = "bg-[var(--accent)]",

}: SummaryCardProps) {
    const iconTone = color.includes("blue")
        ? "bg-sky-100 text-sky-600 dark:bg-sky-950/45 dark:text-sky-300"
        : color.includes("green")
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-300"
            : color.includes("yellow")
                ? "bg-amber-100 text-amber-600 dark:bg-amber-950/45 dark:text-amber-300"
                : "bg-rose-100 text-rose-600 dark:bg-rose-950/45 dark:text-rose-300";

    return (
        <div className="wellness-card min-h-40 p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="pt-1">
                    <p className="text-sm text-[var(--content-muted)]">
                        {title}
                    </p>
                    <h2 className="mt-2 text-4xl font-bold tracking-tight">
                        {value}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--content-muted)]">รายการในระบบ</p>
                </div>

                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconTone}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
