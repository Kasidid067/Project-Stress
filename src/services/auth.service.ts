import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface RegisterUserDTO {
  studentId: string;
  fullname: string;
  phone: string;
  email: string;
  majorId: number;
  trackId?: number | null;
  password: string;
}

export async function registerUser(data: RegisterUserDTO) {
  const exists = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: data.email,
        },
        {
          studentId: data.studentId,
        },
      ],
    },
  });

  if (exists) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    10
  );

  return prisma.user.create({
    data: {
      studentId: data.studentId,
      fullname: data.fullname,
      phone: data.phone,
      email: data.email,
      majorId: data.majorId,
      trackId: data.trackId ?? null,
      password: hashedPassword,
    },
  });
}

export async function loginUser(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("INVALID_LOGIN");
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    throw new Error("INVALID_LOGIN");
  }

  return user;
}
