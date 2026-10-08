import { BookOpen, ExternalLink } from "lucide-react";

type Reference = {
  title: string;
  description: string;
  href: string;
};

export default function ReferenceLinks({ references }: { references: Reference[] }) {
  return (
    <section className="wellness-card p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200"><BookOpen size={22} /></div>
        <div><h2 className="font-bold">แหล่งอ้างอิง</h2><p className="mt-1 text-sm text-[var(--content-muted)]">ข้อมูลประกอบแบบประเมินและแนวทางดูแลตนเอง</p></div>
      </div>
      <ul className="mt-5 space-y-3">
        {references.map((reference) => <li key={reference.href}>
          <a href={reference.href} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4 rounded-2xl border border-[var(--border)] p-4 transition hover:border-sky-300 hover:bg-sky-50/60 dark:hover:bg-sky-950/20">
            <span><span className="block font-semibold text-sky-800 dark:text-sky-200">{reference.title}</span><span className="mt-1 block text-sm leading-6 text-[var(--content-muted)]">{reference.description}</span></span>
            <ExternalLink size={18} className="mt-0.5 shrink-0 text-sky-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </li>)}
      </ul>
    </section>
  );
}
