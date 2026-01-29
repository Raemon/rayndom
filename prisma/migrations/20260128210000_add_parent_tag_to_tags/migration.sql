-- AlterTable
ALTER TABLE "tags" ADD COLUMN "parent_tag_id" INTEGER;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_parent_tag_id_fkey" FOREIGN KEY ("parent_tag_id") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;
