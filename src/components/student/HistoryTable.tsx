import Link from "next/link";
import type { StudentHistory } from "@/types/studentHistory";
import { stressLevelLabel } from "@/lib/displayLabels";

interface Props {
    history: StudentHistory[];
}

export default function HistoryTable({
    history,
}: Props) {

    function badge(level: string) {

        switch (level) {

            case "LOW":
                return "status-low";

            case "MEDIUM":
                return "status-medium";

            case "HIGH":
                return "status-high";

            default:
                return "bg-[var(--surface-muted)] text-[var(--content-muted)] border border-[var(--border)]";
        }
    }

    return (
        <div className="theme-card rounded-2xl">
            <table className="w-full">
                <thead className="border-b">
                    <tr>
                        <th className="p-4 text-left">
                            วันที่
                        </th>

                        <th className="p-4">
                            คะแนน
                        </th>

                        <th className="p-4">
                            ระดับ
                        </th>

                        <th className="p-4">
                            รายละเอียด
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {
                        history.map(item => (
                            <tr
                                key={item.id}
                                className="border-b"
                            >
                                <td className="p-4">
                                    {
                                        new Date(
                                            item.createdAt
                                        ).toLocaleDateString(
                                            "th-TH"
                                        )
                                    }
                                </td>

                                <td className="text-center">
                                    {item.stressScore}%
                                </td>

                                <td className="text-center">
                                    <span
                                        className={`rounded-full px-3 py-1 ${badge(item.stressLevel)}`}
                                    >
                                        {stressLevelLabel(item.stressLevel)}
                                    </span>
                                </td>

                                <td className="text-center">
                                    <Link
                                        href={`/student/result/${item.id}`}
                                        className="text-[var(--accent-strong)]"
                                    >
                                        ดูผล
                                    </Link>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}
