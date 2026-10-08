import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
  calculateScore,
} from "@/lib/st5";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { answers } = await req.json();

  const score = calculateScore(answers);

  const percentScore = Math.round((score / 15) * 100);
  const level = percentScore <= 40 ? "LOW" : percentScore <= 70 ? "MEDIUM" : "HIGH";

  const assessment = await prisma.sT5Assessment.create({
    data: {
      userId: Number(session.user.id),
      totalScore: score,
    },
  });

  await prisma.sT5Answer.createMany({
    data: answers.map(
      (score: number, index: number) => ({
        assessmentId: assessment.id,
        questionNo: index + 1,
        score,
      })
    ),
  });

  await prisma.stressResult.create({
    data: {
      userId: Number(session.user.id),
      assessmentId: assessment.id,
      stressScore: percentScore,
      stressLevel: level,
    },
  });

  return NextResponse.json({
    success: true,
    score: percentScore,
    level,
  });
}
