-- สถานะล่าสุดของบอร์ด ESP32/XD-58C ที่ใช้ร่วมกัน
CREATE TABLE `SensorDeviceStatus` (
    `id` VARCHAR(191) NOT NULL,
    `lastSeenAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
