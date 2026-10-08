import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
    Role,
    StressLevel,
    NotificationType,
    UserStatus,
} from "@prisma/client";

export async function POST(req: Request) {
    console.log("========== ST5 API START ==========");

    try {
        const session = await auth();

        console.log("Session:", session?.user);

        if (
            !session?.user ||
            session.user.role !== Role.STUDENT
        ) {
            console.log("Forbidden");

            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await req.json();

        const answers: {
            questionNo: number;
            score: number;
        }[] = body.answers;
        const pulseBpm = body.pulseBpm === undefined ? undefined : Number(body.pulseBpm);

        console.log("Answers:", answers);

        if (!answers || answers.length !== 5) {
            return NextResponse.json(
                {
                    message:
                        "กรุณาตอบคำถามให้ครบทั้ง 5 ข้อ",
                },
                {
                    status: 400,
                }
            );
        }

        if (pulseBpm !== undefined && (!Number.isInteger(pulseBpm) || pulseBpm < 30 || pulseBpm > 220)) {
            return NextResponse.json(
                { message: "กรุณากรอกค่าชีพจรระหว่าง 30-220 BPM" },
                { status: 400 }
            );
        }

        /*
         * ==========================================
         * 1. คำนวณคะแนน ST-5 เดิม
         * ==========================================
         */

        const totalScore = answers.reduce(
            (sum, item) => sum + item.score,
            0
        );

        /*
         * ==========================================
         * 2. ตรวจสอบคะแนน ST-5
         * ==========================================
         */

        let stressLevel: StressLevel;

        if (totalScore <= 4) {
            stressLevel = StressLevel.LOW;
        } else if (totalScore <= 7) {
            stressLevel = StressLevel.MEDIUM;
        } else {
            stressLevel = StressLevel.HIGH;
        }

        console.log("ST5 Score:", totalScore);
        console.log("ST5 Level:", stressLevel);

        /*
         * ==========================================
         * 3. เริ่ม Transaction
         * ==========================================
         */

        const assessment = await prisma.$transaction(
            async (tx) => {
                /*
                 * ==========================================
                 * 4. ดึงข้อมูลชีพจรล่าสุด
                 * ==========================================
                 */

                const latestPulse = pulseBpm !== undefined
                    ? await tx.pulseRecord.create({
                        data: {
                            userId: Number(session.user.id),
                            bpm: pulseBpm,
                        },
                    })
                    : await tx.pulseRecord.findFirst({
                        where: { userId: Number(session.user.id) },
                        orderBy: { recordedAt: "desc" },
                    });

                console.log(
                    "Latest Pulse:",
                    latestPulse
                );

                /*
                 * ==========================================
                 * 5. ต้องมีข้อมูลชีพจรก่อนประเมินร่วม
                 * ==========================================
                 */

                if (!latestPulse) {
                    throw new Error(
                        "PULSE_REQUIRED"
                    );
                }

                /*
                 * ==========================================
                 * 6. แปลงค่า BPM เป็นคะแนน 0–15
                 *
                 * < 60       = 0
                 * 60–100     = 0
                 * 101–120    = 10
                 * > 120      = 15
                 * ==========================================
                 */

                let pulseScore = 0;

                if (latestPulse.bpm > 120) {
                    pulseScore = 15;
                } else if (latestPulse.bpm > 100) {
                    pulseScore = 10;
                } else {
                    pulseScore = 0;
                }

                /*
                 * ==========================================
                 * 7. คำนวณน้ำหนัก ST-5 70%
                 * ==========================================
                 */

                const st5WeightedScore =
                    totalScore * 0.7;

                /*
                 * ==========================================
                 * 8. คำนวณน้ำหนักชีพจร 30%
                 * ==========================================
                 */

                const pulseWeightedScore =
                    pulseScore * 0.3;

                /*
                 * ==========================================
                 * 9. รวมคะแนน
                 *
                 * คะแนนเต็ม = 15
                 * ==========================================
                 */

                const combinedScore = Math.round(
                    st5WeightedScore +
                    pulseWeightedScore
                );

                /*
                 * ป้องกันค่าหลุดช่วง 0–15
                 */

                const st5Percent = Math.round(
                    (totalScore / 15) * 100
                );
                // ชีพจรไม่ลดคะแนน ST-5 แต่เพิ่มสัญญาณความเสี่ยงได้สูงสุด 30%
                const pulseAdjustment =
                    latestPulse.bpm < 50 || latestPulse.bpm > 120
                        ? 30
                        : latestPulse.bpm > 100
                            ? 15
                            : 0;
                const finalScore = Math.min(
                    100,
                    st5Percent + pulseAdjustment
                );

                /*
                 * ==========================================
                 * 10. แปลผลจากคะแนนรวม
                 *
                 * 0–4   = LOW
                 * 5–7   = MEDIUM
                 * 8–15  = HIGH
                 * ==========================================
                 */

                let finalStressLevel: StressLevel;

                if (finalScore <= 40) {
                    finalStressLevel =
                        StressLevel.LOW;
                } else if (finalScore <= 70) {
                    finalStressLevel =
                        StressLevel.MEDIUM;
                } else {
                    finalStressLevel =
                        StressLevel.HIGH;
                }

                console.log(
                    "================================"
                );

                console.log(
                    "ST5 Original Score:",
                    totalScore
                );

                console.log(
                    "ST5 Weighted 70%:",
                    st5WeightedScore
                );

                console.log(
                    "Pulse BPM:",
                    latestPulse.bpm
                );

                console.log(
                    "Pulse Score:",
                    pulseScore
                );

                console.log(
                    "Pulse Weighted 30%:",
                    pulseWeightedScore
                );

                console.log(
                    "Combined Score:",
                    finalScore
                );

                console.log(
                    "Final Stress Level:",
                    finalStressLevel
                );

                console.log(
                    "================================"
                );

                /*
                 * ==========================================
                 * 11. สร้าง ST-5 Assessment
                 * ==========================================
                 */

                console.log(
                    "Creating ST5 Assessment..."
                );

                const createdAssessment =
                    await tx.sT5Assessment.create({
                        data: {
                            userId: Number(
                                session.user.id
                            ),

                            totalScore,

                            answers: {
                                create: answers.map(
                                    (item) => ({
                                        questionNo:
                                            item.questionNo,

                                        score:
                                            item.score,
                                    })
                                ),
                            },
                        },
                    });

                console.log(
                    "Assessment Created:",
                    createdAssessment
                );

                /*
                 * ==========================================
                 * 12. Recommendation
                 * ==========================================
                 */

                let recommendation = "";

                switch (finalStressLevel) {
                    case StressLevel.LOW:
                        recommendation =
                            "ความเครียดอยู่ในระดับต่ำ ควรรักษาพฤติกรรมที่ดี พักผ่อนให้เพียงพอ และออกกำลังกายอย่างสม่ำเสมอ";
                        break;

                    case StressLevel.MEDIUM:
                        recommendation =
                            "ความเครียดอยู่ในระดับปานกลาง ควรผ่อนคลายด้วยการฟังเพลง ฝึกหายใจ ออกกำลังกาย หรือทำกิจกรรมที่ชอบ";
                        break;

                    case StressLevel.HIGH:
                        recommendation =
                            "ความเครียดอยู่ในระดับสูง ควรปรึกษาอาจารย์ที่ปรึกษา เจ้าหน้าที่ หรือผู้เชี่ยวชาญด้านสุขภาพจิต";
                        break;
                }
                /*
 * ==========================================
 * 13. สร้างข้อความสรุปผล
 * ==========================================
 */

                const pulseStatus =
                    latestPulse.bpm < 60
                        ? "ชีพจรต่ำ"
                        : latestPulse.bpm <= 100
                            ? "ชีพจรอยู่ในเกณฑ์ปกติ"
                            : latestPulse.bpm <= 120
                                ? "ชีพจรค่อนข้างสูง"
                                : "ชีพจรสูงผิดปกติ";

                const levelText =
                    finalStressLevel ===
                        StressLevel.LOW
                        ? "ความเครียดน้อย"
                        : finalStressLevel ===
                            StressLevel.MEDIUM
                            ? "ความเครียดปานกลาง"
                            : "ความเครียดมาก";

                const aiSummary =
                    `คะแนน ST-5 ${totalScore}/15 คิดเป็น ${st5Percent}% ชีพจร ${latestPulse.bpm} BPM (${pulseStatus}) เพิ่มคะแนนความเสี่ยง ${pulseAdjustment}% ดังนั้นคะแนนรวม ${st5Percent}% + ${pulseAdjustment}% = ${finalScore}% อยู่ในระดับ${levelText}`;

                console.log({
                    pulseId: latestPulse.id,
                    st5Score: totalScore,
                    st5WeightedScore,
                    pulseBpm: latestPulse.bpm,
                    pulseScore,
                    pulseWeightedScore,
                    st5Percent,
                    pulseAdjustment,
                    finalScore,
                    finalStressLevel,
                    aiSummary,
                });

                /*
                 * ==========================================
                 * 14. บันทึกผลการประเมิน
                 * ==========================================
                 */

                const stressResult =
                    await tx.stressResult.create({
                        data: {
                            userId: Number(
                                session.user.id
                            ),

                            assessmentId:
                                createdAssessment.id,

                            pulseId:
                                latestPulse.id,

                            stressScore:
                                finalScore,

                            stressLevel:
                                finalStressLevel,

                            recommendation,

                            aiSummary,
                        },
                    });

                console.log(
                    "StressResult Created:",
                    stressResult
                );

                /*
                 * ==========================================
                 * 15. สร้าง Notification
                 * ==========================================
                 */

                await tx.notification.create({
                    data: {
                        userId: Number(
                            session.user.id
                        ),

                        assessmentId:
                            createdAssessment.id,

                        title:
                            "ผลการประเมินพร้อมแล้ว",

                        message:
                            `ผลการประเมินความเครียดของคุณพร้อมดูแล้ว คะแนนความเครียด ${finalScore}%`,

                        type:
                            NotificationType.ASSESSMENT,

                        isRead: false,
                    },
                });

                /*
                 * ==========================================
                 * 16. Notification กรณีความเครียดสูง
                 * ==========================================
                 */

                if (
                    finalStressLevel ===
                    StressLevel.HIGH
                ) {
                    await tx.notification.create({
                        data: {
                            userId: Number(
                                session.user.id
                            ),

                            assessmentId:
                                createdAssessment.id,

                            title:
                                "พบระดับความเครียดสูง",

                            message:
                                "ผลการประเมินของคุณอยู่ในระดับความเครียดมาก กรุณาดูคำแนะนำเพิ่มเติม",

                            type:
                                NotificationType.HIGH_STRESS,

                            isRead: false,
                        },
                    });

                    const student = await tx.user.findUnique({
                        where: { id: Number(session.user.id) },
                        select: { fullname: true, advisorId: true },
                    });

                    const staffAndAdmins = await tx.user.findMany({
                        where: {
                            role: { in: [Role.ADMIN, Role.STAFF] },
                            status: UserStatus.ACTIVE,
                        },
                        select: {
                            id: true,
                            role: true,
                        },
                    });

                    const advisor = student?.advisorId
                        ? await tx.user.findFirst({
                            where: {
                                id: student.advisorId,
                                role: Role.ADVISOR,
                                status: UserStatus.ACTIVE,
                            },
                            select: { id: true },
                        })
                        : null;

                    const alertRecipients = [
                        ...staffAndAdmins.map((user) => ({
                            userId: user.id,
                            assessmentId: createdAssessment.id,
                            title: "แจ้งเตือน: พบนิสิตมีความเครียดสูง",
                            message: `${student?.fullname ?? session.user.name ?? "นิสิต"} ทำแบบประเมินและมีผลอยู่ในระดับความเครียดสูง กรุณาตรวจสอบผลการประเมิน`,
                            type: NotificationType.HIGH_STRESS,
                            isRead: false,
                        })),
                        ...(advisor ? [{
                            userId: advisor.id,
                            assessmentId: createdAssessment.id,
                            title: "แจ้งเตือน: นิสิตในความดูแลมีความเครียดสูง",
                            message: `${student?.fullname ?? "นิสิต"} ในความดูแลของคุณมีผลประเมินความเครียดระดับสูง กรุณาตรวจสอบและให้คำแนะนำ`,
                            type: NotificationType.HIGH_STRESS,
                            isRead: false,
                        }] : []),
                    ];

                    if (alertRecipients.length > 0) {
                        await tx.notification.createMany({
                            data: alertRecipients,
                        });
                    }
                }

                /*
                 * ==========================================
                 * 17. ส่งค่ากลับจาก Transaction
                 * ==========================================
                 */

                return {
                    assessment:
                        createdAssessment,

                    finalScore,

                    finalStressLevel,

                    recommendation,
                };
            }
        );

        /*
         * ==========================================
         * 18. ส่งผลกลับไปยัง Frontend
         * ==========================================
         */

        console.log(
            "========== SUCCESS =========="
        );

        return NextResponse.json({
            success: true,

            assessmentId:
                assessment.assessment.id,

            totalScore:
                assessment.finalScore,

            stressLevel:
                assessment.finalStressLevel,

            recommendation:
                assessment.recommendation,
        });
    } catch (error) {
        console.error(
            "Assessment Error:",
            error
        );

        /*
         * ==========================================
         * กรณียังไม่มีข้อมูลชีพจร
         * ==========================================
         */

        if (
            error instanceof Error &&
            error.message === "PULSE_REQUIRED"
        ) {
            return NextResponse.json(
                {
                    message:
                        "กรุณาวัดชีพจรก่อนทำแบบประเมิน ST-5",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ==========================================
         * Error อื่น ๆ
         * ==========================================
         */

        return NextResponse.json(
            {
                message:
                    "เกิดข้อผิดพลาดภายในระบบ",
            },
            {
                status: 500,
            }
        );
    }
}
