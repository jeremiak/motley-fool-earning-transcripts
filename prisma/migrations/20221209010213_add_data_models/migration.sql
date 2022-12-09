-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "ticker" TEXT
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "callDate" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "Transcript_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
