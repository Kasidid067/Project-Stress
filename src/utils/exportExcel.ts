import * as XLSX from "xlsx";

import type { Report } from "@/types/report";

export function exportReportsToExcel(
    reports: Report[]
) {

    const data = reports.map((report) => ({

        "รหัสนิสิต":
            report.user.studentId,

        "ชื่อ":
            report.user.fullname,

        "หลักสูตร":
            report.user.major.name,

        "คะแนน":
            report.stressScore,

        "ระดับ":
            report.stressLevel,

        "วันที่":
            new Date(
                report.createdAt
            ).toLocaleDateString("th-TH"),

    }));

    const worksheet =
        XLSX.utils.json_to_sheet(data);

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Stress Report"
    );

    const excelBuffer =
        XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

    const blob = new Blob(
        [excelBuffer],
        {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    );

    // ดาวน์โหลดไฟล์
    const url = window.URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = "Stress_Report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
