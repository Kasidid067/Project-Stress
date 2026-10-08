import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  const { id } = await params;
  const name = String((await request.json()).name ?? "").trim();
  if (!name) return NextResponse.json({ message: "กรุณาระบุชื่อวิชาเอก" }, { status: 400 });
  try {
    return NextResponse.json(await prisma.majorTrack.update({ where: { id: Number(id) }, data: { name } }));
  } catch {
    return NextResponse.json({ message: "ไม่สามารถแก้ไขวิชาเอกได้" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.majorTrack.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "ไม่สามารถลบวิชาเอกได้" }, { status: 400 });
  }
}
