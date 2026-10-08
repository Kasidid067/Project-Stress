import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const assessmentId = Number(id);

  if (!Number.isInteger(assessmentId) || assessmentId <= 0) {
    return NextResponse.json({ message: "รหัสผลการประเมินไม่ถูกต้อง" }, { status: 400 });
  }

  const result = await prisma.stressResult.findUnique({
    where: { assessmentId },
    include: {
      assessment: { include: { answers: { orderBy: { questionNo: "asc" } } } },
      pulse: true,
      user: { include: { major: true } },
    },
  });

  if (!result) {
    return NextResponse.json({ message: "ไม่พบผลการประเมิน" }, { status: 404 });
  }

  return NextResponse.json({ result });
}
