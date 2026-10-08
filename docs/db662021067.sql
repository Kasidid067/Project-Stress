-- StressCare schema backup for phpMyAdmin
-- This file creates and selects the requested database: db662021067.
-- Data rows are not included because the configured MySQL server (localhost:3306) was unavailable during export.
-- Generated from prisma/schema.prisma.

CREATE DATABASE IF NOT EXISTS `db662021067`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `db662021067`;
-- CreateTable
CREATE TABLE `Major` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Major_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MajorTrack` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `majorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MajorTrack_majorId_idx`(`majorId`),
    UNIQUE INDEX `MajorTrack_majorId_name_key`(`majorId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'ADVISOR', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `majorId` INTEGER NOT NULL,
    `trackId` INTEGER NULL,
    `advisorId` INTEGER NULL,
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_studentId_key`(`studentId`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_majorId_idx`(`majorId`),
    INDEX `User_trackId_idx`(`trackId`),
    INDEX `User_advisorId_idx`(`advisorId`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_status_idx`(`status`),
    INDEX `User_advisorId_role_idx`(`advisorId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentSupportRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `type` ENUM('ADVISOR_CHANGE', 'PROFILE_CORRECTION') NOT NULL,
    `details` TEXT NOT NULL,
    `status` ENUM('PENDING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `response` TEXT NULL,
    `handledById` INTEGER NULL,
    `handledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentSupportRequest_studentId_status_idx`(`studentId`, `status`),
    INDEX `StudentSupportRequest_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentRiskFollowUp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `status` ENUM('NOT_CONTACTED', 'CONTACTED', 'FOLLOW_UP_SCHEDULED', 'CLOSED') NOT NULL DEFAULT 'NOT_CONTACTED',
    `note` TEXT NULL,
    `nextFollowUpAt` DATETIME(3) NULL,
    `handledById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentRiskFollowUp_studentId_createdAt_idx`(`studentId`, `createdAt`),
    INDEX `StudentRiskFollowUp_status_nextFollowUpAt_idx`(`status`, `nextFollowUpAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ST5Assessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ST5Assessment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ST5Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessmentId` INTEGER NOT NULL,
    `questionNo` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,

    INDEX `ST5Answer_assessmentId_idx`(`assessmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PSS10Assessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PSS10Assessment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PSS10Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessmentId` INTEGER NOT NULL,
    `questionNo` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,

    INDEX `PSS10Answer_assessmentId_idx`(`assessmentId`),
    UNIQUE INDEX `PSS10Answer_assessmentId_questionNo_key`(`assessmentId`, `questionNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PulseRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bpm` INTEGER NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PulseRecord_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PulseMeasurementSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'MEASURING', 'COMPLETED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `bpm` INTEGER NULL,
    `samples` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PulseMeasurementSession_token_key`(`token`),
    INDEX `PulseMeasurementSession_status_expiresAt_idx`(`status`, `expiresAt`),
    INDEX `PulseMeasurementSession_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SensorDeviceStatus` (
    `id` VARCHAR(191) NOT NULL,
    `lastSeenAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StressResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `assessmentId` INTEGER NOT NULL,
    `pulseId` INTEGER NULL,
    `stressScore` INTEGER NOT NULL,
    `stressLevel` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `recommendation` VARCHAR(191) NULL,
    `aiSummary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `StressResult_assessmentId_key`(`assessmentId`),
    UNIQUE INDEX `StressResult_pulseId_key`(`pulseId`),
    INDEX `StressResult_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Activity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `category` ENUM('RELAX', 'EXERCISE', 'MEDITATION', 'MUSIC', 'OTHER') NOT NULL,
    `duration` INTEGER NOT NULL,
    `stressLevel` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `activityId` INTEGER NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `feedbackMood` ENUM('BETTER', 'SAME', 'WORSE') NULL,
    `feedbackNote` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_userId_idx`(`userId`),
    INDEX `ActivityLog_activityId_idx`(`activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `assessmentId` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('ASSESSMENT', 'HIGH_STRESS', 'ACTIVITY', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_userId_isRead_idx`(`userId`, `isRead`),
    INDEX `Notification_createdAt_idx`(`createdAt`),
    INDEX `Notification_assessmentId_idx`(`assessmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MajorTrack` ADD CONSTRAINT `MajorTrack_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `Major`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `Major`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `MajorTrack`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_advisorId_fkey` FOREIGN KEY (`advisorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSupportRequest` ADD CONSTRAINT `StudentSupportRequest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentRiskFollowUp` ADD CONSTRAINT `StudentRiskFollowUp_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentRiskFollowUp` ADD CONSTRAINT `StudentRiskFollowUp_handledById_fkey` FOREIGN KEY (`handledById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ST5Assessment` ADD CONSTRAINT `ST5Assessment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ST5Answer` ADD CONSTRAINT `ST5Answer_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `ST5Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PSS10Assessment` ADD CONSTRAINT `PSS10Assessment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PSS10Answer` ADD CONSTRAINT `PSS10Answer_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `PSS10Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PulseRecord` ADD CONSTRAINT `PulseRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PulseMeasurementSession` ADD CONSTRAINT `PulseMeasurementSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StressResult` ADD CONSTRAINT `StressResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StressResult` ADD CONSTRAINT `StressResult_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `ST5Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StressResult` ADD CONSTRAINT `StressResult_pulseId_fkey` FOREIGN KEY (`pulseId`) REFERENCES `PulseRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `ST5Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


