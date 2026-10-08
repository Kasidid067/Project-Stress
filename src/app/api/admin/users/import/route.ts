import bcrypt from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ImportRow = {
  rowNumber?: number;
  studentId?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  major?: string;
  track?: string;
  advisor?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown) => String(value ?? "").trim();
const compareKey = (value: unknown) => text(value).toLocaleLowerCase("th-TH");

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  }

  const body = (await request.json()) as {
    rows?: unknown;
    advisorId?: unknown;
    initialPassword?: unknown;
  };

  if (!Array.isArray(body.rows) || body.rows.length === 0 || body.rows.length > 500) {
    return NextResponse.json({ message: "กรุณาระบุข้อมูลนิสิต 1–500 รายการ" }, { status: 400 });
  }

  const initialPassword = text(body.initialPassword);
  if (initialPassword && initialPassword.length < 6) {
    return NextResponse.json({ message: "รหัสผ่านเริ่มต้นต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }

  const selectedAdvisorId = body.advisorId ? Number(body.advisorId) : null;
  if (body.advisorId && (!Number.isInteger(selectedAdvisorId) || !selectedAdvisorId || selectedAdvisorId <= 0)) {
    return NextResponse.json({ message: "ข้อมูลอาจารย์ที่ปรึกษาไม่ถูกต้อง" }, { status: 400 });
  }

  const rows = body.rows as ImportRow[];
  const errors: string[] = [];
  const normalizedRows = rows.map((row, index) => {
    const rowNumber = Number(row.rowNumber) || index + 2;
    const studentId = text(row.studentId);
    const fullname = text(row.fullname);
    const email = text(row.email).toLowerCase();
    const phone = text(row.phone);
    const major = text(row.major);
    const track = text(row.track);
    const advisor = text(row.advisor);
    const password = text(row.password) || initialPassword;

    if (!studentId || !fullname || !email || !major) {
      errors.push(`แถว ${rowNumber}: ต้องมีรหัสนิสิต ชื่อ-นามสกุล อีเมล และหลักสูตร`);
    }
    if (email && !emailPattern.test(email)) {
      errors.push(`แถว ${rowNumber}: รูปแบบอีเมลไม่ถูกต้อง`);
    }
    if (!password) {
      errors.push(`แถว ${rowNumber}: กรุณาระบุรหัสผ่านในไฟล์ หรือกรอกรหัสผ่านเริ่มต้น`);
    } else if (password.length < 6) {
      errors.push(`แถว ${rowNumber}: รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร`);
    }

    return { rowNumber, studentId, fullname, email, phone, major, track, advisor, password };
  });

  const seenStudentIds = new Set<string>();
  const seenEmails = new Set<string>();
  for (const row of normalizedRows) {
    if (row.studentId && seenStudentIds.has(row.studentId)) errors.push(`แถว ${row.rowNumber}: รหัสนิสิตซ้ำในไฟล์`);
    if (row.email && seenEmails.has(row.email)) errors.push(`แถว ${row.rowNumber}: อีเมลซ้ำในไฟล์`);
    seenStudentIds.add(row.studentId);
    seenEmails.add(row.email);
  }

  const [majors, advisors, existingUsers] = await Promise.all([
    prisma.major.findMany({ select: { id: true, name: true, tracks: { select: { id: true, name: true } } } }),
    prisma.user.findMany({
      where: { role: Role.ADVISOR, status: UserStatus.ACTIVE },
      select: { id: true, fullname: true },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { studentId: { in: normalizedRows.map((row) => row.studentId).filter(Boolean) } },
          { email: { in: normalizedRows.map((row) => row.email).filter(Boolean) } },
        ],
      },
      select: { studentId: true, email: true },
    }),
  ]);

  const majorByName = new Map(majors.map((major) => [compareKey(major.name), major]));
  const advisorByName = new Map(advisors.map((advisor) => [compareKey(advisor.fullname), advisor]));
  const selectedAdvisor = selectedAdvisorId ? advisors.find((advisor) => advisor.id === selectedAdvisorId) : null;
  if (selectedAdvisorId && !selectedAdvisor) {
    return NextResponse.json({ message: "ไม่พบอาจารย์ที่ปรึกษาที่เลือก หรือบัญชีไม่ได้เปิดใช้งาน" }, { status: 400 });
  }

  const existingStudentIds = new Set(existingUsers.map((user) => user.studentId).filter(Boolean));
  const existingEmails = new Set(existingUsers.map((user) => user.email));

  const prepared = normalizedRows.flatMap((row) => {
    const major = majorByName.get(compareKey(row.major));
    if (!major) {
      errors.push(`แถว ${row.rowNumber}: ไม่พบหลักสูตร “${row.major}” ในระบบ`);
      return [];
    }

    const advisor = row.advisor ? advisorByName.get(compareKey(row.advisor)) : selectedAdvisor;
    const track = row.track ? major.tracks.find((item) => compareKey(item.name) === compareKey(row.track)) : null;
    if (row.track && !track) {
      errors.push(`แถว ${row.rowNumber}: ไม่พบวิชาเอก “${row.track}” ในหลักสูตร “${row.major}”`);
      return [];
    }
    if (row.advisor && !advisor) {
      errors.push(`แถว ${row.rowNumber}: ไม่พบอาจารย์ที่ปรึกษา “${row.advisor}” ที่เปิดใช้งานในระบบ`);
      return [];
    }
    if (existingStudentIds.has(row.studentId)) errors.push(`แถว ${row.rowNumber}: รหัสนิสิตนี้มีอยู่แล้วในระบบ`);
    if (existingEmails.has(row.email)) errors.push(`แถว ${row.rowNumber}: อีเมลนี้มีอยู่แล้วในระบบ`);

    return [{ ...row, majorId: major.id, trackId: track?.id ?? null, advisorId: advisor?.id ?? null }];
  });

  if (errors.length > 0) {
    return NextResponse.json({ message: "ตรวจพบข้อมูลที่ไม่ถูกต้อง", errors }, { status: 400 });
  }

  const usersToCreate = await Promise.all(
    prepared.map(async (row) => ({
      ...row,
      password: await bcrypt.hash(row.password, 10),
    })),
  );

  await prisma.$transaction(
    usersToCreate.map((row) =>
      prisma.user.create({
        data: {
          studentId: row.studentId,
          fullname: row.fullname,
          email: row.email,
          phone: row.phone || null,
          password: row.password,
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
          majorId: row.majorId,
          trackId: row.trackId,
          advisorId: row.advisorId,
        },
      }),
    ),
  );

  return NextResponse.json({ message: `นำเข้าข้อมูลนิสิตสำเร็จ ${usersToCreate.length} รายการ` });
}
