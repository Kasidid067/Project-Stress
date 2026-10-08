import { ST5_CHOICES } from "@/data/st5Choice";
import { ST5_QUESTIONS } from "@/data/st5Questions";

type Answer = {
  id?: number;
  questionNo: number;
  score: number;
};

export default function ST5AnswerList({ answers }: { answers: Answer[] }) {
  return (
    <div className="mt-5 space-y-3">
      {answers.map((answer) => {
        const question = ST5_QUESTIONS.find((item) => item.no === answer.questionNo);
        const choice = ST5_CHOICES.find((item) => item.score === answer.score);

        return (
          <article key={answer.id ?? answer.questionNo} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-sm font-semibold text-teal-700">ข้อ {answer.questionNo}</p>
            <p className="mt-1 font-medium text-[var(--content-text)]">{question?.question ?? "ไม่พบข้อความคำถาม"}</p>
            <p className="mt-3 text-sm text-[var(--content-muted)]">คำตอบ: <span className="font-semibold text-[var(--content-text)]">{answer.score} · {choice?.text ?? "ไม่ระบุ"}</span></p>
          </article>
        );
      })}
    </div>
  );
}
