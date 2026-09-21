CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"from_state" text,
	"to_state" text,
	"meta_json" jsonb,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundle_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code_hash" text NOT NULL,
	"code_enc" text,
	"last4" text NOT NULL,
	"tier_id" text NOT NULL,
	"status" text DEFAULT 'unassigned' NOT NULL,
	"owner_reseller_id" text,
	"assigned_user_id" text,
	"pool_id" text,
	"order_id" text,
	"cost_paise" integer DEFAULT 0 NOT NULL,
	"batch" text,
	"delivered_at" timestamp with time zone,
	"redeemed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gate_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code_hash" text NOT NULL,
	"type" text NOT NULL,
	"label" text,
	"reseller_id" text,
	"bound_user_id" text,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"order_id" text NOT NULL,
	"user_id" text NOT NULL,
	"buyer_name" text,
	"buyer_gstin" text,
	"description" text NOT NULL,
	"taxable_paise" integer NOT NULL,
	"cgst_paise" integer DEFAULT 0 NOT NULL,
	"sgst_paise" integer DEFAULT 0 NOT NULL,
	"igst_paise" integer DEFAULT 0 NOT NULL,
	"total_paise" integer NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"tier_id" text,
	"amount_paise" integer NOT NULL,
	"gateway" text NOT NULL,
	"gateway_order_id" text,
	"status" text DEFAULT 'created' NOT NULL,
	"idempotency_key" text,
	"meta_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"channel" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tier_id" text NOT NULL,
	"bundle_code_id" text,
	"pool_id" text,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"reminder_sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"gateway_payment_id" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"status" text NOT NULL,
	"refund_id" text,
	"refunded_at" timestamp with time zone,
	"raw_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"reseller_id" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"note" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pool_members" (
	"id" text PRIMARY KEY NOT NULL,
	"pool_id" text NOT NULL,
	"user_id" text NOT NULL,
	"seat_no" integer NOT NULL,
	"order_id" text,
	"payment_id" text,
	"paid_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"pass_id" text,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pools" (
	"id" text PRIMARY KEY NOT NULL,
	"tier_id" text NOT NULL,
	"name" text,
	"creator_user_id" text NOT NULL,
	"reseller_id" text,
	"seats" integer NOT NULL,
	"seat_price_paise" integer NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"payment_model" text DEFAULT 'escrow' NOT NULL,
	"distribution_mode" text DEFAULT 'shared' NOT NULL,
	"split_mode" text DEFAULT 'reseller_keeps' NOT NULL,
	"split_json" jsonb,
	"settlement_json" jsonb,
	"assignment_json" jsonb,
	"bundle_code_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"filled_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"fulfilled_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resellers" (
	"user_id" text PRIMARY KEY NOT NULL,
	"business_name" text,
	"kyc_status" text DEFAULT 'pending' NOT NULL,
	"bank_json" jsonb,
	"reseller_code_id" text,
	"default_markup_pct" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_paise" integer NOT NULL,
	"reseller_price_paise" integer NOT NULL,
	"seats_default" integer DEFAULT 10 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"pass_id" text NOT NULL,
	"tool_id" text NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"claimed_at" timestamp with time zone,
	"vendor_ref" text,
	"issue_note" text
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"vendor_name" text NOT NULL,
	"vendor_id" text,
	"category" text NOT NULL,
	"offer_title" text NOT NULL,
	"blurb" text NOT NULL,
	"value_usd" integer NOT NULL,
	"tier_min" text NOT NULL,
	"badge" text,
	"hue" integer DEFAULT 220 NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"gstin" text,
	"referred_by_reseller_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"claim_url_template" text,
	"coupon_mode" text DEFAULT 'link' NOT NULL,
	"contract_ref" text,
	"eligibility_note" text
);
--> statement-breakpoint
ALTER TABLE "bundle_codes" ADD CONSTRAINT "bundle_codes_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_bundle_code_id_bundle_codes_id_fk" FOREIGN KEY ("bundle_code_id") REFERENCES "public"."bundle_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_reseller_id_resellers_user_id_fk" FOREIGN KEY ("reseller_id") REFERENCES "public"."resellers"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resellers" ADD CONSTRAINT "resellers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_claims" ADD CONSTRAINT "tool_claims_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_claims" ADD CONSTRAINT "tool_claims_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bundle_codes_hash_idx" ON "bundle_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "bundle_codes_status_idx" ON "bundle_codes" USING btree ("status","tier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gate_codes_hash_idx" ON "gate_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_idx" ON "invoices" USING btree ("number");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_order_idx" ON "invoices" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_idem_idx" ON "orders" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_gw_idx" ON "orders" USING btree ("gateway_order_id");--> statement-breakpoint
CREATE INDEX "otp_identifier_idx" ON "otp_codes" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "passes_user_idx" ON "passes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_gw_idx" ON "payments" USING btree ("gateway_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pool_members_seat_idx" ON "pool_members" USING btree ("pool_id","seat_no");--> statement-breakpoint
CREATE UNIQUE INDEX "pool_members_user_idx" ON "pool_members" USING btree ("pool_id","user_id");--> statement-breakpoint
CREATE INDEX "pools_status_idx" ON "pools" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pools_reseller_idx" ON "pools" USING btree ("reseller_id");--> statement-breakpoint
CREATE INDEX "tool_claims_pass_idx" ON "tool_claims" USING btree ("pass_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_idx" ON "users" USING btree ("phone");