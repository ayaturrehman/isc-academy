/*
  Warnings:

  - You are about to drop the column `class_id` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_class_id_fkey";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "class_id";

-- DropTable
DROP TABLE "classes";
