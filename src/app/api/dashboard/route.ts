import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    include: {
      major: true,

      results: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },

      pulses: {
        orderBy: {
          recordedAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "ไม่พบผู้ใช้งาน" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    fullname: user.fullname,
    studentId: user.studentId,
    major: user.major.name,
    role: user.role,

    latestStress: user.results[0] ?? null,
    latestPulse: user.pulses[0] ?? null,
  });
}
