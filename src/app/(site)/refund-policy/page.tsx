import { Prose } from "@/components/ui/Prose";
import { settings, site } from "@/config/site";

export const metadata = { title: "Refund policy" };

/** DRAFT — must be reviewed by counsel and matched to vendor agreements before launch (§0). */
export default function RefundPolicyPage() {
  return (
    <Prose title="Refund & Code Works Guarantee policy" updated="21 September 2026 (draft)">
      <h2>1. Code Works Guarantee</h2>
      <p>
        Every activation code sold by {site.name} is covered by our Code Works Guarantee. If a bundle code, or any
        individual tool claim inside it, fails to activate through no fault of the customer, we will:
      </p>
      <ul>
        <li>Issue a replacement code or claim within 2 business days, or</li>
        <li>
          If a replacement cannot be provided within {settings.guaranteeDays} days of your report, refund the proportional
          value of the affected tool (retail-weighted share of the pass price) to the original payment method.
        </li>
      </ul>

      <h2>2. What is not covered</h2>
      <ul>
        <li>Accounts that do not meet the vendor&apos;s eligibility rule shown on the claim page (for example, &quot;new users only&quot;).</li>
        <li>Codes shared publicly, resold outside the platform, or claimed after the pass expiry date.</li>
        <li>Changes a vendor makes to its plan after activation.</li>
      </ul>

      <h2>3. Pool refunds</h2>
      <p>
        Seat payments are held until a pool fills. If a pool does not fill within {settings.poolExpiryDays} days of
        opening, it expires and every paid seat is refunded automatically via the payment gateway. Gateway refunds
        typically settle in 5–7 business days.
      </p>

      <h2>4. Direct purchases</h2>
      <p>
        Because activation codes are delivered instantly and are single-use, direct purchases are non-refundable once
        the bundle code has been redeemed, except under the Code Works Guarantee above. Unredeemed codes may be refunded
        within 48 hours of purchase on request.
      </p>

      <h2>5. How to raise a claim</h2>
      <p>
        Use the &quot;Report a problem&quot; action next to the tool in My Pass, or email {site.supportEmail} with your
        order ID. Never send your activation code by email.
      </p>
    </Prose>
  );
}
