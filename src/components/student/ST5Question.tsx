interface Props {
    no: number;
    question: string;
    value: number | null;
    onChange: (score: number) => void;
}

export default function ST5Question({
    no,
    question,
    value,
    onChange,
}: Props) {

    return (

        <div className="wellness-card p-5 sm:p-6">
            <h2 className="mb-3 text-xl font-bold">
                ข้อ {no}
            </h2>

            <p className="mb-6 text-lg">
                {question}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                {[
                    { score: 0, text: "เป็นน้อยมากหรือแทบไม่มี" },
                    { score: 1, text: "เป็นบางครั้ง" },
                    { score: 2, text: "เป็นบ่อยครั้ง" },
                    { score: 3, text: "เป็นประจำ" },
                ].map((item) => (

                    <label
                        key={item.score}
                        className={`flex cursor-pointer flex-col items-center rounded-2xl border p-4 transition-all
            ${value === item.score
                                ? "border-teal-500 bg-teal-50 shadow-md dark:bg-teal-950/30"
                                : "border-[var(--border)] hover:border-teal-400 hover:bg-teal-50/60"
                            }`}
                    >

                        <input
                            type="radio"
                            name={`question-${no}`}
                            value={item.score}
                            checked={value === item.score}
                            onChange={() => onChange(item.score)}
                            className="mb-3 h-5 w-5"
                        />

                        <span className="text-3xl font-bold text-gray-800">
                            {item.score}
                        </span>

                        <span className="mt-2 text-center text-sm text-[var(--content-muted)]">
                            {item.text}
                        </span>

                    </label>

                ))}

            </div>
        </div>
    );
}
