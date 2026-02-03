-- CreateTable
CREATE TABLE "commands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commands_name_key" ON "commands"("name");
