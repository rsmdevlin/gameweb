-- AlterTable: Add chat theme, wallpaper, and accent color fields
ALTER TABLE `User` ADD COLUMN `chatTheme` VARCHAR(191) NOT NULL DEFAULT 'classic';
ALTER TABLE `User` ADD COLUMN `chatWallpaper` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `accentColor` VARCHAR(191) NOT NULL DEFAULT '#6366f1';
