-- Composite index for the observatory's day-by-day feed pagination, which filters
-- stories by source and scans/orders by created_at (see loadStoryDay in
-- app/observatory/storyData.ts). Stories now accumulate indefinitely, so this keeps
-- the per-day cursor lookups from degrading as the table grows.
CREATE INDEX "stories_source_created_at_idx" ON "stories"("source", "created_at");
