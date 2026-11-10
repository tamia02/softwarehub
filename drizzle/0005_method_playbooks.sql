CREATE TABLE "method_playbooks" (
	"slug" text PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
