/*
  Warnings:

  - You are about to alter the column `imageUrl` on the `recipe_steps` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `recipe_steps` MODIFY `imageUrl` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `recipes` ADD COLUMN `calories` INTEGER NULL DEFAULT 0,
    ADD COLUMN `carbs` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `fat` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `protein` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `videoUrl` VARCHAR(191) NULL DEFAULT '';
