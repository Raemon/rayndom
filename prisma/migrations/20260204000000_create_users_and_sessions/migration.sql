-- These tables exist in prod from an out-of-band creation (likely an early
-- `prisma db push`) but no migration ever created them. That meant a shadow-DB
-- build (e.g. `prisma migrate dev`) blew up the moment a later migration added
-- a foreign key referencing `users`. This migration uses IF NOT EXISTS so it is
-- a no-op on prod and seeds the shadow DB cleanly. Timestamped just before
-- 20260205000000_add_user_id_to_tables, which is the first migration to
-- reference users.

-- CreateTable users
CREATE TABLE IF NOT EXISTS "users" (
  "id"            SERIAL       NOT NULL,
  "email"         TEXT         NOT NULL,
  "password_hash" TEXT         NOT NULL,
  "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateTable sessions
CREATE TABLE IF NOT EXISTS "sessions" (
  "id"         TEXT         NOT NULL,
  "user_id"    INTEGER      NOT NULL,
  "expires_at" TIMESTAMPTZ  NOT NULL,
  "created_at" TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (guarded so it doesn't fail on prod where the FK already exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_user_id_fkey') THEN
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
