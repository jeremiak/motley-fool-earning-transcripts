/*
  Warnings:

  - The primary key for the `Transcript` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `callDate` on the `Transcript` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Transcript` table. All the data in the column will be lost.
  - Added the required column `fiscalYear` to the `Transcript` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "companyTicker" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "content" TEXT NOT NULL
);
INSERT INTO "new_Transcript" ("companyName", "companyTicker", "content", "id", "quarter", "sourceUrl") SELECT "companyName", "companyTicker", "content", "id", "quarter", "sourceUrl" FROM "Transcript";
DROP TABLE "Transcript";
ALTER TABLE "new_Transcript" RENAME TO "Transcript";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
