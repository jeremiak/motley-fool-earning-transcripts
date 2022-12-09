/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `companyId` on the `Transcript` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Transcript` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyTicker` to the `Transcript` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Company";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transcript" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyName" TEXT NOT NULL,
    "companyTicker" TEXT NOT NULL,
    "callDate" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "content" TEXT NOT NULL
);
INSERT INTO "new_Transcript" ("callDate", "content", "id", "quarter", "sourceUrl", "year") SELECT "callDate", "content", "id", "quarter", "sourceUrl", "year" FROM "Transcript";
DROP TABLE "Transcript";
ALTER TABLE "new_Transcript" RENAME TO "Transcript";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
