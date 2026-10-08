import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });

  const { id } = await params;
  const majorId = Number(id);
  const name = String((await request.json()).name ?? "").trim();
  if (!Number.isInteger(majorId) || !name) return NextResponse.json({ message: "กรุณาระบุชื่อวิชาเอก" }, { status: 400 });
  if (!(await prisma.major.findUnique({ where: { id: majorId }, select: { id: true } }))) return NextResponse.json({ message: "ไม่พบหลักสูตร" }, { status: 404 });
  try {
    const track = await prisma.majorTrack.create({ data: { majorId, name } });
    return NextResponse.json(track, { status: 201 });
  } catch {
    return NextResponse.json({ message: "มีวิชาเอกนี้ในหลักสูตรแล้ว" }, { status: 409 });
  }
}
