-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedAccounts" JSONB NOT NULL DEFAULT '[]';
