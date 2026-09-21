import "server-only";
import { site } from "@/config/site";
import { formatINR } from "./format";

/**
 * Email (Resend) + SMS (MSG91). When the provider keys are missing the
 * message is logged to the server console instead, so every flow works in
 * development without accounts.
 */

export const emailConfigured = () => !!process.env.RESEND_API_KEY;
export const smsConfigured = () => !!process.env.MSG91_AUTH_KEY;

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (!emailConfigured()) {
    // Bodies can contain activation codes: only ever echo them outside production.
    if (process.env.NODE_ENV === "production") console.warn(`[email→${to}] message dropped: RESEND_API_KEY not set`);
    else console.info(`[email→${to}] ${subject}\n${text ?? html.replace(/<[^>]+>/g, "")}`);
    return { ok: true, mocked: true };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? `${site.name} <noreply@softwarehubpool.example>`;
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) {
    console.error("[email] send failed", error);
    return { ok: false, mocked: false };
  }
  return { ok: true, mocked: false };
}

export async function sendSms(to: string, message: string, templateId?: string) {
  if (!smsConfigured()) {
    if (process.env.NODE_ENV === "production") console.warn(`[sms→${to}] (MSG91_AUTH_KEY not set — message dropped)`);
    else console.info(`[sms→${to}] ${message}`);
    return { ok: true, mocked: true };
  }
  // MSG91 Flow API — every message must map to a DLT-approved template.
  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { "Content-Type": "application/json", authkey: process.env.MSG91_AUTH_KEY! },
    body: JSON.stringify({
      template_id: templateId ?? process.env.MSG91_TEMPLATE_GENERIC,
      sender: process.env.MSG91_SENDER ?? "SHPOOL",
      mobiles: to.replace(/^\+/, ""),
      VAR1: message,
    }),
  });
  if (!res.ok) {
    console.error("[sms] send failed", await res.text());
    return { ok: false, mocked: false };
  }
  return { ok: true, mocked: false };
}

/* ------------------------------------------------------------------
   Templates
   ------------------------------------------------------------------ */

const wrap = (title: string, body: string) => `
<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#0b0f19">
  <h1 style="font-size:22px;margin:0 0 16px">${title}</h1>
  ${body}
  <p style="margin-top:32px;font-size:12px;color:#9aa0b0">${site.name} · ${site.supportEmail}</p>
</div>`;

export async function notifyOtp(channel: "email" | "sms", to: string, code: string) {
  if (channel === "email") {
    return sendEmail(to, `${code} is your ${site.name} sign-in code`, wrap("Your sign-in code", `<p style="font-size:32px;letter-spacing:8px;font-weight:800">${code}</p><p>Valid for 10 minutes. Never share it.</p>`), `Your code is ${code}`);
  }
  return sendSms(to, `${code} is your ${site.name} sign-in code. Valid 10 min.`, process.env.MSG91_TEMPLATE_OTP);
}

export async function notifyCodeDelivery(user: { email?: string | null; phone?: string | null }, tierName: string, code: string, orderId: string) {
  const html = wrap(
    `Your ${tierName} activation code`,
    `<p>Thanks for your purchase. Redeem this code from <a href="${site.url}/account/redeem">My Pass</a> to unlock your tools:</p>
     <p style="font-family:monospace;font-size:22px;letter-spacing:3px;font-weight:700">${code}</p>
     <p>Order ${orderId}. This code is single-use — keep it private.</p>`,
  );
  if (user.email) await sendEmail(user.email, `Your ${tierName} activation code`, html, `Your ${tierName} code: ${code}`);
  if (user.phone) await sendSms(user.phone, `${site.name}: your ${tierName} code is ${code}. Redeem at ${site.url}/account/redeem`);
}

export async function notifyPoolEvent(
  user: { email?: string | null; phone?: string | null },
  event: "joined" | "filled" | "fulfilled" | "expired",
  pool: { id: string; name?: string | null; seatPricePaise: number },
) {
  const link = `${site.url}/pool/${pool.id}`;
  const name = pool.name ?? "your pool";
  const copy = {
    joined: [`You're in: ${name}`, `Your seat (${formatINR(pool.seatPricePaise)}) is confirmed. We'll tell you when the pool fills.`],
    filled: [`${name} is full`, `All seats are paid. We're buying the bundle now — tools land in My Pass shortly.`],
    fulfilled: [`Your tools are ready`, `The bundle for ${name} is fulfilled. Claim your tools from My Pass.`],
    expired: [`${name} expired — you've been refunded`, `The pool didn't fill in time, so your seat payment of ${formatINR(pool.seatPricePaise)} is being refunded to the original method (5–7 business days).`],
  }[event];
  const html = wrap(copy[0], `<p>${copy[1]}</p><p><a href="${link}">${link}</a></p>`);
  if (user.email) await sendEmail(user.email, copy[0], html, `${copy[1]} ${link}`);
  if (user.phone) await sendSms(user.phone, `${site.name}: ${copy[0]}. ${link}`);
}

export async function notifyPayout(user: { email?: string | null }, amountPaise: number, status: string) {
  if (!user.email) return;
  await sendEmail(user.email, `Payout ${status}: ${formatINR(amountPaise)}`, wrap(`Payout ${status}`, `<p>Your payout request of <strong>${formatINR(amountPaise)}</strong> is now <strong>${status}</strong>.</p>`));
}

export async function notifyPassExpiring(user: { email?: string | null; phone?: string | null }, tierName: string, expiresAt: Date) {
  const when = expiresAt.toLocaleDateString("en-IN", { dateStyle: "medium" });
  if (user.email) await sendEmail(user.email, `Your ${tierName} expires on ${when}`, wrap("Your pass is expiring", `<p>Your ${tierName} expires on ${when}. Buy a new pass to keep your tools.</p><p><a href="${site.url}/home#pricing">See pricing</a></p>`));
  if (user.phone) await sendSms(user.phone, `${site.name}: your ${tierName} expires ${when}. Renew at ${site.url}`);
}

export async function notifyAdmin(subject: string, body: string) {
  const to = process.env.ADMIN_EMAIL ?? "admin@softwarehubpool.example";
  await sendEmail(to, `[SHP] ${subject}`, wrap(subject, `<p>${body}</p>`), body);
}
