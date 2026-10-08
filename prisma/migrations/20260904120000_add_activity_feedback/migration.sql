-- AlterTable
ALTER TABLE `ActivityLog`
    ADD COLUMN `feedbackMood` ENUM('BETTER', 'SAME', 'WORSE') NULL,
    ADD COLUMN `feedbackNote` VARCHAR(1000) NULL;
