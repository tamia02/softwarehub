ALTER TABLE "users" ADD COLUMN "telegram_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "users_telegram_idx" ON "users" USING btree ("telegram_id");