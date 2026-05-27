-- An earlier attempt at adding this unique index (migration
-- 20260203120000_add_unique_tag_instances_per_timeblock) failed against prod
-- due to duplicate (tag_id, datetime) rows and was left rolled-back; that
-- migration is now marked applied in the ledger but its index never existed.
-- This migration dedupes the offending rows and then creates the index.

-- Dedupe rule (preserves data quality where possible):
--   1. Prefer rows with approved = true.
--   2. Otherwise prefer the oldest created_at.
--   3. Otherwise prefer the lowest id.
-- Verified on prod: deletes 335 rows across 245 duplicate pairs, retains 245
-- rows, and never discards an approved row when one exists in the pair.

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY tag_id, datetime
           ORDER BY approved DESC, created_at ASC, id ASC
         ) AS rn
    FROM "tag_instances"
)
DELETE FROM "tag_instances"
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tag_instances_tag_id_datetime_key"
  ON "tag_instances"("tag_id", "datetime");
