import { HeartHandshake, Sparkles } from "lucide-react";

interface Props { fullname: string; }

export default function WelcomeCard({ fullname }: Props) {
  return (
    <section className="wellness-hero p-6 sm:p-8">
      <div className="relative z-10 max-w-2xl">
        <div className="wellness-badge w-fit bg-white/70 text-teal-700 shadow-sm"><Sparkles size={14} /> วันนี้ใจคุณเป็นอย่างไรบ้าง?</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl dark:text-teal-50">สวัสดี, {fullname} <span aria-hidden="true">👋</span></h1>
        <p className="mt-3 max-w-xl leading-7 text-teal-900/75 dark:text-teal-100/75">นี่คือพื้นที่เล็ก ๆ สำหรับเช็กอินความรู้สึก พักหายใจ และดูแลตัวเองในจังหวะของคุณ</p>
      </div>
      <div className="absolute bottom-6 right-6 z-10 hidden rounded-[1.5rem] bg-white/65 p-4 text-rose-500 shadow-md sm:block dark:bg-slate-900/45"><HeartHandshake size={36} strokeWidth={1.8} /></div>
    </section>
  );
}
