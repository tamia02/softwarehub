/**
 * Database schema (§7). Postgres via Drizzle.
 *
 * Conventions
 *  - All money columns are integers in paise.
 *  - "Enum" columns are `text` validated in application code (see src/lib/validation.ts)
 *    so the schema stays portable between PGlite (dev) and Postgres (prod).
 *  - Codes are stored as salted SHA-256 hashes. Bundle codes additionally keep an
 *    AES-GCM encrypted copy until they are delivered to the buyer, then it is wiped.
 */
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    role: text("role").notNull().default("customer"), // customer | reseller | admin
    gstin: text("gstin"),
    referredByResellerId: text("referred_by_reseller_id"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email), uniqueIndex("users_phone_idx").on(t.phone)],
);

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(), // email or E.164 phone
    channel: text("channel").notNull(), // email | sms
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: ts("expires_at").notNull(),
    consumedAt: ts("consumed_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("otp_identifier_idx").on(t.identifier)],
);

export const resellers = pgTable("resellers", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  businessName: text("business_name"),
  kycStatus: text("kyc_status").notNull().default("pending"), // pending | submitted | verified | rejected
  bankJson: jsonb("bank_json").$type<{ accountName?: string; accountNumber?: string; ifsc?: string; upi?: string; pan?: string }>(),
  resellerCodeId: text("reseller_code_id"),
  defaultMarkupPct: integer("default_markup_pct").notNull().default(0),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const gateCodes = pgTable(
  "gate_codes",
  {
    id: text("id").primaryKey(),
    codeHash: text("code_hash").notNull(),
    type: text("type").notNull(), // customer | reseller
    label: text("label"),
    resellerId: text("reseller_id"),
    boundUserId: text("bound_user_id"),
    maxUses: integer("max_uses").notNull().default(1),
    uses: integer("uses").notNull().default(0),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    expiresAt: ts("expires_at"),
    status: text("status").notNull().default("active"), // active | locked | void
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("gate_codes_hash_idx").on(t.codeHash)],
);

export const tiers = pgTable("tiers", {
  id: text("id").primaryKey(), // starter | pro
  name: text("name").notNull(),
  pricePaise: integer("price_paise").notNull(),
  resellerPricePaise: integer("reseller_price_paise").notNull(),
  seatsDefault: integer("seats_default").notNull().default(10),
  active: boolean("active").notNull().default(true),
});

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  claimUrlTemplate: text("claim_url_template"), // e.g. https://vendor.com/redeem?code={code}
  couponMode: text("coupon_mode").notNull().default("link"), // link | coupon | manual
  contractRef: text("contract_ref"),
  eligibilityNote: text("eligibility_note"),
});

export const tools = pgTable("tools", {
  id: text("id").primaryKey(), // slug
  name: text("name").notNull(),
  vendorName: text("vendor_name").notNull(),
  vendorId: text("vendor_id").references(() => vendors.id),
  category: text("category").notNull(),
  offerTitle: text("offer_title").notNull(),
  blurb: text("blurb").notNull(),
  valueUsd: integer("value_usd").notNull(),
  tierMin: text("tier_min").notNull(), // starter | pro
  badge: text("badge"),
  hue: integer("hue").notNull().default(220),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const bundleCodes = pgTable(
  "bundle_codes",
  {
    id: text("id").primaryKey(),
    codeHash: text("code_hash").notNull(),
    codeEnc: text("code_enc"), // AES-GCM ciphertext, wiped after delivery
    last4: text("last4").notNull(),
    tierId: text("tier_id")
      .notNull()
      .references(() => tiers.id),
    status: text("status").notNull().default("unassigned"), // unassigned | assigned | redeemed | void
    ownerResellerId: text("owner_reseller_id"),
    assignedUserId: text("assigned_user_id"),
    poolId: text("pool_id"),
    orderId: text("order_id"),
    costPaise: integer("cost_paise").notNull().default(0),
    batch: text("batch"),
    deliveredAt: ts("delivered_at"),
    redeemedAt: ts("redeemed_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("bundle_codes_hash_idx").on(t.codeHash), index("bundle_codes_status_idx").on(t.status, t.tierId)],
);

export const passes = pgTable(
  "passes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    tierId: text("tier_id")
      .notNull()
      .references(() => tiers.id),
    bundleCodeId: text("bundle_code_id").references(() => bundleCodes.id),
    poolId: text("pool_id"),
    activatedAt: ts("activated_at").notNull().defaultNow(),
    expiresAt: ts("expires_at").notNull(),
    reminderSentAt: ts("reminder_sent_at"),
  },
  (t) => [index("passes_user_idx").on(t.userId)],
);

export const toolClaims = pgTable(
  "tool_claims",
  {
    id: text("id").primaryKey(),
    passId: text("pass_id")
      .notNull()
      .references(() => passes.id),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id),
    status: text("status").notNull().default("available"), // available | claimed | issue
    claimedAt: ts("claimed_at"),
    vendorRef: text("vendor_ref"),
    issueNote: text("issue_note"),
  },
  (t) => [index("tool_claims_pass_idx").on(t.passId)],
);

export const pools = pgTable(
  "pools",
  {
    id: text("id").primaryKey(),
    tierId: text("tier_id")
      .notNull()
      .references(() => tiers.id),
    name: text("name"),
    creatorUserId: text("creator_user_id")
      .notNull()
      .references(() => users.id),
    resellerId: text("reseller_id"),
    seats: integer("seats").notNull(),
    seatPricePaise: integer("seat_price_paise").notNull(),
    status: text("status").notNull().default("open"), // draft | open | filled | paid | fulfilled | expired
    paymentModel: text("payment_model").notNull().default("escrow"), // escrow | single
    distributionMode: text("distribution_mode").notNull().default("shared"), // shared | assigned
    splitMode: text("split_mode").notNull().default("reseller_keeps"), // reseller_keeps | share_equal | custom
    splitJson: jsonb("split_json").$type<Record<string, number>>(), // custom: userId → pct
    settlementJson: jsonb("settlement_json").$type<unknown>(), // immutable statement written at fulfilment
    assignmentJson: jsonb("assignment_json").$type<Record<string, string[]>>(), // userId → toolIds (assigned mode)
    bundleCodeId: text("bundle_code_id"),
    expiresAt: ts("expires_at").notNull(),
    filledAt: ts("filled_at"),
    paidAt: ts("paid_at"),
    fulfilledAt: ts("fulfilled_at"),
    expiredAt: ts("expired_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("pools_status_idx").on(t.status), index("pools_reseller_idx").on(t.resellerId)],
);

export const poolMembers = pgTable(
  "pool_members",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pools.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    seatNo: integer("seat_no").notNull(),
    orderId: text("order_id"),
    paymentId: text("payment_id"),
    paidAt: ts("paid_at"),
    refundedAt: ts("refunded_at"),
    passId: text("pass_id"),
    joinedAt: ts("joined_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("pool_members_seat_idx").on(t.poolId, t.seatNo), uniqueIndex("pool_members_user_idx").on(t.poolId, t.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(), // direct | pool_seat | reseller_code
    tierId: text("tier_id"),
    amountPaise: integer("amount_paise").notNull(),
    gateway: text("gateway").notNull(), // razorpay | mock
    gatewayOrderId: text("gateway_order_id"),
    status: text("status").notNull().default("created"), // created | paid | fulfilled | awaiting_inventory | refunded | failed
    idempotencyKey: text("idempotency_key"),
    metaJson: jsonb("meta_json").$type<Record<string, unknown>>(),
    createdAt: ts("created_at").notNull().defaultNow(),
    paidAt: ts("paid_at"),
  },
  (t) => [uniqueIndex("orders_idem_idx").on(t.idempotencyKey), index("orders_user_idx").on(t.userId), uniqueIndex("orders_gw_idx").on(t.gatewayOrderId)],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    gatewayPaymentId: text("gateway_payment_id").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    status: text("status").notNull(), // captured | refunded | failed
    refundId: text("refund_id"),
    refundedAt: ts("refunded_at"),
    rawJson: jsonb("raw_json").$type<unknown>(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("payments_gw_idx").on(t.gatewayPaymentId)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    number: text("number").notNull(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    userId: text("user_id").notNull(),
    buyerName: text("buyer_name"),
    buyerGstin: text("buyer_gstin"),
    description: text("description").notNull(),
    taxablePaise: integer("taxable_paise").notNull(),
    cgstPaise: integer("cgst_paise").notNull().default(0),
    sgstPaise: integer("sgst_paise").notNull().default(0),
    igstPaise: integer("igst_paise").notNull().default(0),
    totalPaise: integer("total_paise").notNull(),
    issuedAt: ts("issued_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("invoices_number_idx").on(t.number), uniqueIndex("invoices_order_idx").on(t.orderId)],
);

export const payouts = pgTable("payouts", {
  id: text("id").primaryKey(),
  resellerId: text("reseller_id")
    .notNull()
    .references(() => resellers.userId),
  amountPaise: integer("amount_paise").notNull(),
  status: text("status").notNull().default("requested"), // requested | approved | paid | rejected
  note: text("note"),
  requestedAt: ts("requested_at").notNull().defaultNow(),
  paidAt: ts("paid_at"),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id"),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    fromState: text("from_state"),
    toState: text("to_state"),
    metaJson: jsonb("meta_json").$type<Record<string, unknown>>(),
    at: ts("at").notNull().defaultNow(),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId)],
);

export type User = typeof users.$inferSelect;
export type Reseller = typeof resellers.$inferSelect;
export type ToolRow = typeof tools.$inferSelect;
export type TierRow = typeof tiers.$inferSelect;
export type BundleCode = typeof bundleCodes.$inferSelect;
export type Pass = typeof passes.$inferSelect;
export type ToolClaim = typeof toolClaims.$inferSelect;
export type Pool = typeof pools.$inferSelect;
export type PoolMember = typeof poolMembers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
