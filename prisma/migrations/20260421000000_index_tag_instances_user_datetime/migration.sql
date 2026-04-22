-- Composite index to speed up the common per-user date-range scan over tag_instances
-- (e.g. /api/timer/tag-instances on the logging/zen page, which filters by user_id and datetime).
CREATE INDEX "tag_instances_user_id_datetime_idx" ON "tag_instances"("user_id", "datetime");
