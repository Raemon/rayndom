-- AlterTable
ALTER TABLE "tag_instances" ADD COLUMN     "anti_useful" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "useful" BOOLEAN NOT NULL DEFAULT false;
