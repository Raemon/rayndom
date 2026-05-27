-- AlterTable
ALTER TABLE "stories" ADD COLUMN "points" INTEGER;
ALTER TABLE "stories" ADD COLUMN "comment_count" INTEGER;
ALTER TABLE "stories" ALTER COLUMN "byline" DROP NOT NULL;

-- Backfill: parse existing "X points, Y comments" bylines into the new columns.
-- Only matches rows whose byline strictly conforms to that format (HN/LW); arXiv
-- bylines like "Author · Date" don't match and stay NULL on both columns.
UPDATE "stories"
SET
  "points" = (substring("byline" from '^(-?\d+) points?,'))::int,
  "comment_count" = (substring("byline" from ', (\d+) comments?$'))::int
WHERE "byline" ~ '^-?\d+ points?, \d+ comments?$';

-- Now that points/comment_count carry the structured data, drop the redundant
-- byline string for sources that have those columns. arXiv keeps its byline.
UPDATE "stories" SET "byline" = NULL WHERE "source" IN ('hackernews', 'lw');
