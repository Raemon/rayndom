-- Add user_id to checklist_items
ALTER TABLE "checklist_items" ADD COLUMN "user_id" INTEGER;
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add user_id to timeblocks
ALTER TABLE "timeblocks" ADD COLUMN "user_id" INTEGER;
ALTER TABLE "timeblocks" ADD CONSTRAINT "timeblocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add user_id to tags
ALTER TABLE "tags" ADD COLUMN "user_id" INTEGER;
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add user_id to tag_instances
ALTER TABLE "tag_instances" ADD COLUMN "user_id" INTEGER;
ALTER TABLE "tag_instances" ADD CONSTRAINT "tag_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add user_id to commands
ALTER TABLE "commands" ADD COLUMN "user_id" INTEGER;
ALTER TABLE "commands" ADD CONSTRAINT "commands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
