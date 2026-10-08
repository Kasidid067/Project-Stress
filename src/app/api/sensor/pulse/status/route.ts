import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// หากไม่ได้รับสัญญาณจากบอร์ดเกิน 10 วินาที ให้ถือว่าอุปกรณ์ออฟไลน์
const DEVICE_ONLINE_WINDOW_MS = 10_000;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const device = await prisma.sensorDeviceStatus.findUnique({
    where: { id: "shared-xd58c" },
    select: { lastSeenAt: true },
  });

  const online = Boolean(
    device && Date.now() - device.lastSeenAt.getTime() <= DEVICE_ONLINE_WINDOW_MS
  );

  return NextResponse.json({
    online,
    lastSeenAt: device?.lastSeenAt ?? null,
  });
}
