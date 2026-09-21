import { NextResponse } from "next/server";
import { z } from "zod";

export const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
export const unauthorized = () => fail("Sign in to continue.", 401);

/** Parse JSON body against a zod schema; returns a 400 response on failure. */
export async function parseBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: fail("Invalid JSON body.") };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    return { error: fail(first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid request.") };
  }
  return { data: result.data };
}

export const tierSchema = z.enum(["starter", "pro"]);
