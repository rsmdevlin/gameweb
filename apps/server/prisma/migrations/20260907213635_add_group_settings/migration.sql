-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `inviteLink` VARCHAR(191) NULL,
    ADD COLUMN `whoCanAddMembers` VARCHAR(191) NOT NULL DEFAULT 'admins',
    ADD COLUMN `whoCanSendMessages` VARCHAR(191) NOT NULL DEFAULT 'all';

-- CreateIndex
CREATE UNIQUE INDEX `Chat_inviteLink_key` ON `Chat`(`inviteLink`);
