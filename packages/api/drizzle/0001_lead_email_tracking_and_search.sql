-- Trigram support for the admin search indexes below (available on Neon and stock Postgres).
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "result_email_sent_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "leads_name_trgm_idx" ON "leads" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "leads_email_trgm_idx" ON "leads" USING gin ("email" gin_trgm_ops);