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

-- AddForeignKey
ALTER TABLE `StudentRiskFollowUp` ADD CONSTRAINT `StudentRiskFollowUp_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `StudentRiskFollowUp` ADD CONSTRAINT `StudentRiskFollowUp_handledById_fkey` FOREIGN KEY (`handledById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
