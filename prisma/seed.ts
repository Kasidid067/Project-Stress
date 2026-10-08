import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  console.log("🌱 Seeding...");

  //------------------------------------
  // Major
  //------------------------------------

  await prisma.major.createMany({
    data: [
      { name: "วิทยาการคอมพิวเตอร์" },
      { name: "เทคโนโลยีสารสนเทศ" },
      { name: "วิทยาการข้อมูล" },
      { name: "ปัญญาประดิษฐ์" },
    ],
    skipDuplicates: true,
  });

  //------------------------------------
  // Admin
  //------------------------------------

  const password = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@stresscare.com",
    },
    update: {},
    create: {
      studentId: "0000000000",
      fullname: "System Admin",
      email: "admin@stresscare.com",
      phone: "0000000000",
      password,
      role: "ADMIN",
      majorId: 1,
    },
  });

  //------------------------------------
  // Activity
  //------------------------------------

  await prisma.activity.createMany({
    data: [

      {
        title: "เดินเล่น 15 นาที",
        description: "ช่วยผ่อนคลายความเครียด",
        category: "EXERCISE",
        duration: 15,
        stressLevel: "LOW",
      },

      {
        title: "ฝึกหายใจ",
        description: "หายใจเข้าออกช้า ๆ",
        category: "MEDITATION",
        duration: 5,
        stressLevel: "MEDIUM",
      },

      {
        title: "ฟังเพลง",
        description: "เพลงบรรเลง",
        category: "MUSIC",
        duration: 20,
        stressLevel: "HIGH",
      },

    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed Success");

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
