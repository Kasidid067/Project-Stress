import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const configuredKey = process.env.SENSOR_API_KEY;
  return Boolean(configuredKey) && request.headers.get("x-sensor-api-key") === configuredKey;
}

// บอร์ดเรียกปลายทางนี้ระหว่างวัด เพื่อยืนยันว่าอุปกรณ์ยังทำงานอยู่
export async function GET(request: NextRequest) {
  if (!process.env.SENSOR_API_KEY) {
    return NextResponse.json({ message: "ยังไม่ได้ตั้งค่ากุญแจสำหรับเซ็นเซอร์" }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  const now = new Date();
  await prisma.sensorDeviceStatus.upsert({
    where: { id: "shared-xd58c" },
    create: { id: "shared-xd58c", lastSeenAt: now },
    update: { lastSeenAt: now },
  });

  return NextResponse.json({ online: true, lastSeenAt: now });
}
