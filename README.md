This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## การเชื่อมต่อบอร์ดเซ็นเซอร์ XD-58C

ระบบเตรียมปลายทางรับค่าชีพจร (BPM) จาก XD-58C ไว้ที่ `POST /api/sensor/pulse` โดยเซ็นเซอร์รุ่นนี้ไม่ใช้ค่า SpO₂

1. คัดลอกค่า `SENSOR_API_KEY` จาก `.env.example` ไปตั้งใน `.env` และตั้งค่าเดียวกันในบอร์ด
2. บอร์ดส่ง header `x-sensor-api-key` และ JSON ดังนี้

```json
{
  "studentId": "662021067",
  "bpm": 72,
  "measuredAt": "2026-09-05T10:30:00.000Z"
}
```

3. สำหรับการทดสอบในเครือข่ายเดียวกัน ให้ใช้ IP ของเครื่องที่รันเว็บ เช่น `http://192.168.x.x:3001/api/sensor/pulse` ไม่ใช่ `localhost`
4. เมื่อนำขึ้นใช้งานจริง ให้ใช้ HTTPS และห้ามฝังกุญแจจริงในโค้ดที่เผยแพร่
5. เฟิร์มแวร์ของบอร์ดต้องแปลงสัญญาณดิบจาก XD-58C เป็นค่า BPM ก่อนส่งมายัง API

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
