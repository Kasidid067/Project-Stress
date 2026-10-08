import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import type { Report } from "@/types/report";

// Roboto ครอบคลุมภาษาอังกฤษ ส่วน Sarabun ที่อยู่ใน public/fonts รองรับภาษาไทย
(pdfMake as any).vfs = pdfFonts.vfs;

function levelLabel(level: Report["stressLevel"]) {
  return level === "HIGH" ? "สูง" : level === "MEDIUM" ? "ปานกลาง" : "ต่ำ";
}

function levelColor(level: Report["stressLevel"]) {
  return level === "HIGH" ? "#dc2626" : level === "MEDIUM" ? "#d97706" : "#059669";
}

export function exportReportsToPDF(
    reports: Report[]
) {
    const fontBaseUrl = `${window.location.origin}/fonts/`;

    (pdfMake as any).addFonts({
        Sarabun: {
            normal: `${fontBaseUrl}Sarabun-Regular.ttf`,
            bold: `${fontBaseUrl}Sarabun-Bold.ttf`,
            italics: `${fontBaseUrl}Sarabun-Regular.ttf`,
            bolditalics: `${fontBaseUrl}Sarabun-Bold.ttf`,
        },
    });

    const low = reports.filter((report) => report.stressLevel === "LOW").length;
    const medium = reports.filter((report) => report.stressLevel === "MEDIUM").length;
    const high = reports.filter((report) => report.stressLevel === "HIGH").length;

    const body = [

        [
            "รหัสนิสิต",
            "ชื่อ-นามสกุล",
            "หลักสูตร",
            "คะแนน",
            "ระดับ",
            "วันที่",
        ].map((text) => ({ text, color: "#ffffff", bold: true, alignment: "center" })),

        ...reports.map(report => ([
            { text: report.user.studentId, alignment: "center" },
            report.user.fullname,
            report.user.major.name,
            { text: String(report.stressScore), alignment: "center" },
            {
                text: levelLabel(report.stressLevel),
                color: levelColor(report.stressLevel),
                bold: true,
                alignment: "center",
            },
            { text: new Date(report.createdAt).toLocaleDateString("th-TH"), alignment: "center" },
        ])),

    ];

    const docDefinition = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [32, 44, 32, 45],
        defaultStyle: {
            font: "Sarabun",
            fontSize: 10,
            color: "#1f2937",
        },
        header: {
            text: "StressCare · รายงานภายในระบบ",
            margin: [40, 16, 40, 0],
            color: "#64748b",
            fontSize: 8,
        },
        footer: (currentPage: number, pageCount: number) => ({
            text: `หน้า ${currentPage} / ${pageCount}`,
            alignment: "center",
            color: "#64748b",
            fontSize: 8,
            margin: [0, 0, 0, 15],
        }),

        content: [

            {
                columns: [
                    {
                        stack: [
                            { text: "StressCare", color: "#0f766e", bold: true, fontSize: 17 },
                            { text: "รายงานผลการประเมินความเครียด", style: "title" },
                            { text: `จัดทำเมื่อ ${new Date().toLocaleString("th-TH")}`, style: "muted" },
                        ],
                    },
                    {
                        text: `ทั้งหมด\n${reports.length} รายการ`,
                        alignment: "right",
                        color: "#0f766e",
                        bold: true,
                        fontSize: 12,
                        margin: [0, 6, 0, 0],
                    },
                ],
                columnGap: 16,
                margin: [0, 0, 0, 18],
            },

            {
                table: {

                    headerRows: 1,

                    // A4 แนวนอน: กันความกว้างให้ชื่อหลักสูตร และไม่ให้คอลัมน์ท้ายถูกตัด
                    widths: [74, 118, "*", 44, 62, 72],

                    body,

                },
                layout: {
                    fillColor: (rowIndex: number) =>
                        rowIndex === 0 ? "#0f766e" : rowIndex % 2 === 0 ? "#f0fdfa" : "#ffffff",
                    hLineColor: () => "#cbd5e1",
                    vLineColor: () => "#e2e8f0",
                    paddingLeft: () => 7,
                    paddingRight: () => 7,
                    paddingTop: () => 6,
                    paddingBottom: () => 6,
                },
            },
            {
                columns: [
                    { text: `ระดับต่ำ ${low} รายการ`, color: "#059669" },
                    { text: `ระดับปานกลาง ${medium} รายการ`, color: "#d97706", alignment: "center" },
                    { text: `ระดับสูง ${high} รายการ`, color: "#dc2626", alignment: "right" },
                ],
                margin: [0, 15, 0, 0],
                style: "summary",
            },

        ],

        styles: {

            title: { fontSize: 20, bold: true },
            muted: { color: "#64748b", fontSize: 9, margin: [0, 2, 0, 0] },
            summary: { fontSize: 10, bold: true },

        },

    };

    pdfMake.createPdf(docDefinition as any).download(
        "Stress_Report.pdf"
    );

}
