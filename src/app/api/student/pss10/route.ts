import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

const reversed = new Set([4, 5, 7, 8]);

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 403 });
  const assessments = await prisma.pSS10Assessment.findMany({ where: { userId: Number(session.user.id) }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(assessments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const answers = body?.answers as { questionNo: number; score: number }[] | undefined;
  const pulseBpm = Number(body?.pulseBpm);
  const invalidAnswers = !answers || answers.length !== 10 || new Set(answers.map((answer) => answer.questionNo)).size !== 10 || answers.some((answer) => !Number.isInteger(answer.questionNo) || answer.questionNo < 1 || answer.questionNo > 10 || !Number.isInteger(answer.score) || answer.score < 0 || answer.score > 4);
  if (invalidAnswers) return NextResponse.json({ message: "กรุณาตอบ PSS-10 ให้ครบทั้ง 10 ข้อ" }, { status: 400 });
  if (!Number.isInteger(pulseBpm) || pulseBpm < 30 || pulseBpm > 220) return NextResponse.json({ message: "กรุณากรอกค่าชีพจรระหว่าง 30-220 BPM" }, { status: 400 });

  const totalScore = answers.reduce((sum, answer) => sum + (reversed.has(answer.questionNo) ? 4 - answer.score : answer.score), 0);
  const assessment = await prisma.$transaction(async (tx) => {
    await tx.pulseRecord.create({ data: { userId: Number(session.user.id), bpm: pulseBpm } });
    return tx.pSS10Assessment.create({ data: { userId: Number(session.user.id), totalScore, answers: { create: answers.map((answer) => ({ questionNo: answer.questionNo, score: answer.score })) } } });
  });

  return NextResponse.json({ assessmentId: assessment.id, totalScore }, { status: 201 });
}
