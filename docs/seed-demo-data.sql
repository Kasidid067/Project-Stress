-- StressCare demo data
-- Import this file only after the database schema has been created.
-- This file contains no real student, assessment, pulse, or activity-log data.

SET NAMES utf8mb4;
SET @seeded_at = NOW(3);

START TRANSACTION;

-- The current database model uses Major as the programme/major master data.
INSERT INTO `Major` (`name`, `createdAt`, `updatedAt`) VALUES
  ('วิทยาการคอมพิวเตอร์และสารสนเทศ', @seeded_at, @seeded_at),
  ('วิทยาศาสตร์ข้อมูลและนวัตกรรมดิจิทัล', @seeded_at, @seeded_at)
ON DUPLICATE KEY UPDATE
  `updatedAt` = VALUES(`updatedAt`);

-- Demo administrator
-- Student ID: admin
-- Password:   admin123
-- Change this account or delete it before using the system in production.
INSERT INTO `User` (
  `studentId`, `fullName`, `phone`, `email`, `password`, `role`, `status`,
  `majorId`, `advisorId`, `lastLogin`, `createdAt`, `updatedAt`
) VALUES (
  'admin',
  'System Admin',
  NULL,
  'admin@stresscare.local',
  '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2',
  'ADMIN',
  'ACTIVE',
  NULL,
  NULL,
  NULL,
  @seeded_at,
  @seeded_at
)
ON DUPLICATE KEY UPDATE
  `studentId` = VALUES(`studentId`),
  `fullName` = VALUES(`fullName`),
  `password` = VALUES(`password`),
  `role` = 'ADMIN',
  `status` = 'ACTIVE',
  `updatedAt` = VALUES(`updatedAt`);

-- Recommended activities for low, medium, and high stress levels.
-- INSERT ... SELECT prevents duplicate demo activities when this file is run again.
INSERT INTO `Activity` (
  `title`, `description`, `category`, `duration`, `stressLevel`, `createdAt`, `updatedAt`
)
SELECT 'ฝึกหายใจ', 'หายใจเข้าออกช้า ๆ เพื่อช่วยผ่อนคลาย', 'RELAX', 5, 'LOW', @seeded_at, @seeded_at
WHERE NOT EXISTS (SELECT 1 FROM `Activity` WHERE `title` = 'ฝึกหายใจ' AND `stressLevel` = 'LOW');

INSERT INTO `Activity` (
  `title`, `description`, `category`, `duration`, `stressLevel`, `createdAt`, `updatedAt`
)
SELECT 'ฟังเพลง หรือ งานอดิเรก', 'ฟังเพลง หรือทำสิ่งที่ชอบเพื่อพักจากความกังวล', 'RELAX', 20, 'MEDIUM', @seeded_at, @seeded_at
WHERE NOT EXISTS (SELECT 1 FROM `Activity` WHERE `title` = 'ฟังเพลง หรือ งานอดิเรก' AND `stressLevel` = 'MEDIUM');

INSERT INTO `Activity` (
  `title`, `description`, `category`, `duration`, `stressLevel`, `createdAt`, `updatedAt`
)
SELECT 'เดินเล่น 15 นาที', 'ขยับร่างกายเบา ๆ เพื่อช่วยลดความตึงเครียด', 'EXERCISE', 15, 'MEDIUM', @seeded_at, @seeded_at
WHERE NOT EXISTS (SELECT 1 FROM `Activity` WHERE `title` = 'เดินเล่น 15 นาที' AND `stressLevel` = 'MEDIUM');

INSERT INTO `Activity` (
  `title`, `description`, `category`, `duration`, `stressLevel`, `createdAt`, `updatedAt`
)
SELECT 'พักผ่อนให้เพียงพอ', 'จัดเวลานอนให้เหมาะสมและหลีกเลี่ยงกิจกรรมที่กระตุ้นก่อนนอน', 'RELAX', 60, 'HIGH', @seeded_at, @seeded_at
WHERE NOT EXISTS (SELECT 1 FROM `Activity` WHERE `title` = 'พักผ่อนให้เพียงพอ' AND `stressLevel` = 'HIGH');

INSERT INTO `Activity` (
  `title`, `description`, `category`, `duration`, `stressLevel`, `createdAt`, `updatedAt`
)
SELECT 'เดินเล่น 15 นาที', 'ขยับร่างกายเบา ๆ เพื่อช่วยลดความตึงเครียด', 'EXERCISE', 15, 'HIGH', @seeded_at, @seeded_at
WHERE NOT EXISTS (SELECT 1 FROM `Activity` WHERE `title` = 'เดินเล่น 15 นาที' AND `stressLevel` = 'HIGH');

COMMIT;
