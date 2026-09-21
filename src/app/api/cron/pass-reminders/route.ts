import { fail, json } from "@/lib/api";
import { cronAuthorized } from "@/lib/cron.server";
import { sendPassReminders } from "@/lib/passes.server";
import { getSettings } from "@/lib/settings.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/cron/pass-reminders — emails/SMS members whose pass expires within `passReminderDays`. */
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return fail("Unauthorized", 401);
  const s = await getSettings();
  const sent = await sendPassReminders(s.passReminderDays);
  return json({ ok: true, sent });
}
