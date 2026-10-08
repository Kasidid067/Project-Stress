FROM node:20-bookworm-slim AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma ต้องใช้ OpenSSL สำหรับเชื่อมต่อ MySQL ใน Debian slim image
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma migrate deploy ทำงานใน stage นี้ด้วย จึงต้องมี OpenSSL เช่นกัน
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app ./

EXPOSE 3000

# migrate deploy ทำงานแบบ idempotent: ใช้ได้ทุกครั้งที่เริ่มคอนเทนเนอร์
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
