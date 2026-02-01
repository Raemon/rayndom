-- AlterTable
ALTER TABLE "checklist_items" ADD COLUMN     "section" TEXT;

UPDATE "checklist_items" SET "section" = 'morning' WHERE "orienting_block" = true;
