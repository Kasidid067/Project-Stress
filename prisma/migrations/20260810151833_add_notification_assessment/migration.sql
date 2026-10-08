-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `assessmentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Notification_assessmentId_idx` ON `Notification`(`assessmentId`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `ST5Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
