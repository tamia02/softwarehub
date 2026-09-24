CREATE TABLE "bundle_items" (
	"id" text PRIMARY KEY NOT NULL,
	"bundle_id" text NOT NULL,
	"product_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"blurb" text NOT NULL,
	"price_paise" integer NOT NULL,
	"badge" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text,
	"bundle_id" text,
	"reseller_id" text,
	"order_id" text,
	"product_code_id" text,
	"qty" integer DEFAULT 1 NOT NULL,
	"price_paise" integer NOT NULL,
	"base_price_paise" integer NOT NULL,
	"commission_paise" integer NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"delivered_at" timestamp with time zone,
	"confirm_deadline" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"code_hash" text NOT NULL,
	"code_enc" text,
	"last4" text NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"order_id" text,
	"reserved_for_user_id" text,
	"batch" text,
	"sold_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"vendor" text NOT NULL,
	"category" text NOT NULL,
	"blurb" text NOT NULL,
	"description" text,
	"reseller_id" text,
	"base_price_paise" integer NOT NULL,
	"commission_pct" integer DEFAULT 20 NOT NULL,
	"delivery_type" text DEFAULT 'code' NOT NULL,
	"warranty_days" integer DEFAULT 14 NOT NULL,
	"logo_url" text,
	"hue" integer DEFAULT 220 NOT NULL,
	"badge" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_bundle_id_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_orders" ADD CONSTRAINT "market_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_orders" ADD CONSTRAINT "market_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_orders" ADD CONSTRAINT "market_orders_bundle_id_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_codes" ADD CONSTRAINT "product_codes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bundle_items_idx" ON "bundle_items" USING btree ("bundle_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bundles_slug_idx" ON "bundles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "market_orders_user_idx" ON "market_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "market_orders_reseller_idx" ON "market_orders" USING btree ("reseller_id");--> statement-breakpoint
CREATE INDEX "market_orders_status_idx" ON "market_orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "product_codes_hash_idx" ON "product_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "product_codes_stock_idx" ON "product_codes" USING btree ("product_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_reseller_idx" ON "products" USING btree ("reseller_id");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("active");