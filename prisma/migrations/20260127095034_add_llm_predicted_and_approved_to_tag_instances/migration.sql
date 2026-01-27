-- AlterTable
ALTER TABLE "tag_instances" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "llm_predicted" BOOLEAN NOT NULL DEFAULT false;
