CREATE TABLE `PulseMeasurementSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'MEASURING', 'COMPLETED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `bpm` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PulseMeasurementSession_token_key`(`token`),
    INDEX `PulseMeasurementSession_status_expiresAt_idx`(`status`, `expiresAt`),
    INDEX `PulseMeasurementSession_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PulseMeasurementSession`
    ADD CONSTRAINT `PulseMeasurementSession_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
