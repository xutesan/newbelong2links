-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
