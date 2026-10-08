import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PulseMeasurementStatus, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const MEASUREMENT_TIMEOUT_MS = 2 * 60 * 1000;

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์เริ่มการวัดชีพจร" }, { status: 403 });
  }

  const userId = Number(session.user.id);
  const now = new Date();
  await prisma.pulseMeasurementSession.updateMany({
    where: { userId, status: { in: [PulseMeasurementStatus.PENDING, PulseMeasurementStatus.MEASURING] }, expiresAt: { lt: now } },
    data: { status: PulseMeasurementStatus.EXPIRED },
  });

  const activeSession = await prisma.pulseMeasurementSession.findFirst({
    where: { userId, status: { in: [PulseMeasurementStatus.PENDING, PulseMeasurementStatus.MEASURING] }, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });

  if (activeSession) {
    return NextResponse.json({ id: activeSession.id, status: activeSession.status, expiresAt: activeSession.expiresAt });
  }

  const measurement = await prisma.pulseMeasurementSession.create({
    data: { token: crypto.randomUUID(), userId, expiresAt: new Date(now.getTime() + MEASUREMENT_TIMEOUT_MS) },
  });
  return NextResponse.json({ id: measurement.id, status: measurement.status, expiresAt: measurement.expiresAt }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์ดูสถานะการวัดชีพจร" }, { status: 403 });
  }

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "รหัสรายการวัดไม่ถูกต้อง" }, { status: 400 });
  }

  const measurement = await prisma.pulseMeasurementSession.findFirst({
    where: { id, userId: Number(session.user.id) },
  });
  if (!measurement) {
    return NextResponse.json({ message: "ไม่พบรายการวัดชีพจร" }, { status: 404 });
  }

  if (measurement.status !== PulseMeasurementStatus.COMPLETED && measurement.status !== PulseMeasurementStatus.EXPIRED && measurement.expiresAt <= new Date()) {
    const expired = await prisma.pulseMeasurementSession.update({ where: { id }, data: { status: PulseMeasurementStatus.EXPIRED } });
    return NextResponse.json(expired);
  }

  return NextResponse.json(measurement);
}
