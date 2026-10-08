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

-- AlterTable
ALTER TABLE `User` ADD COLUMN `trackId` INTEGER NULL;
CREATE INDEX `User_trackId_idx` ON `User`(`trackId`);

-- AddForeignKey
ALTER TABLE `MajorTrack` ADD CONSTRAINT `MajorTrack_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `Major`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `User` ADD CONSTRAINT `User_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `MajorTrack`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
