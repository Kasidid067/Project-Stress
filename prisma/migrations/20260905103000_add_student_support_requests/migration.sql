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

-- AddForeignKey
ALTER TABLE `StudentSupportRequest`
    ADD CONSTRAINT `StudentSupportRequest_studentId_fkey`
    FOREIGN KEY (`studentId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
