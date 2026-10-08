import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 6;

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const requestedPage = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const [totalItems, assessments] = await Promise.all([
    prisma.stressResult.count(),
    prisma.stressResult.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullname: true,
            studentId: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    assessments,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
    },
  });
}
