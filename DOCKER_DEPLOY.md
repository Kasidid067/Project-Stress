# นำ StressCare ขึ้น Docker

## เตรียมค่า secret

คัดลอกไฟล์ตัวอย่างก่อน แล้วเปลี่ยนรหัสผ่านทุกค่า:

```powershell
Copy-Item .env.production.example .env.production
```

สร้างค่า `AUTH_SECRET` ได้ด้วย:

```powershell
openssl rand -base64 32
```

`SENSOR_API_KEY` ต้องใช้ค่าเดียวกับที่ตั้งไว้ใน ESP32 และห้ามนำ `.env.production` ขึ้น Git

## เริ่มระบบ

```powershell
docker compose up -d --build
docker compose ps
```

เปิด `http://localhost:3067` เพื่อตรวจสอบ ระบบจะรัน Prisma migration อัตโนมัติก่อนเปิดเว็บ

## คำสั่งดูแลระบบ

```powershell
docker compose logs -f app
docker compose logs -f mysql
docker compose down
docker compose up -d --build
```

อย่าใช้ `docker compose down -v` บนระบบจริง เพราะจะลบ Docker volume และข้อมูลฐานข้อมูล

## ย้ายขึ้นเซิร์ฟเวอร์

1. ติดตั้ง Docker Engine และ Docker Compose บนเซิร์ฟเวอร์
2. คัดลอก source code และ `.env.production` ไปยังเซิร์ฟเวอร์
3. เปิดพอร์ต 3067 เฉพาะเครือข่ายที่อนุญาต หรือวาง Nginx/Caddy หน้าเว็บเพื่อใช้ HTTPS
4. รัน `docker compose up -d --build`
5. เปลี่ยน `API_URL`, `COMMAND_URL`, `HEARTBEAT_URL` ใน ESP32 ให้ชี้ IP/โดเมนของเซิร์ฟเวอร์ใหม่

ฐานข้อมูลเก็บใน volume `stresscare_mysql_data` จึงไม่หายเมื่ออัปเดตคอนเทนเนอร์
