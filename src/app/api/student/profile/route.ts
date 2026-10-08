import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
      advisor: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: {
      id: Number(session.user.id),
    },
    data: {
      fullname: body.fullname,
      phone: body.phone,
    },
  });

  return NextResponse.json(user);
}
