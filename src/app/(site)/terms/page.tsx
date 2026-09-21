import { Prose } from "@/components/ui/Prose";
import { site } from "@/config/site";

export const metadata = { title: "Terms of service" };

/** DRAFT — placeholder structure; replace with counsel-reviewed terms before launch. */
export default function TermsPage() {
  return (
    <Prose title="Terms of service" updated="21 September 2026 (draft)">
      <h2>1. The service</h2>
      <p>
        {site.name} sells annual passes that bundle activation codes and claim links for third-party software plans.
        Each tool is provided by its own vendor under that vendor&apos;s terms; we are not the provider of the tools.
      </p>
      <h2>2. Passes and codes</h2>
      <ul>
        <li>A pass is valid for one year from activation and is not renewable automatically.</li>
        <li>Activation codes are single-use and personal. Sharing or reselling codes outside the platform voids the pass.</li>
        <li>Vendor eligibility rules (for example new-user only) are shown on each claim page and apply.</li>
      </ul>
      <h2>3. Pools</h2>
      <p>
        A pool is a group purchase of one bundle. Seat payments are held until the pool fills and are refunded if it
        expires. Pool creators and resellers must not collect money outside the platform unless the pool is set to the
        single-payer model.
      </p>
      <h2>4. Resellers</h2>
      <p>
        Resellers must complete KYC before payouts. Revenue splits are computed by the platform and are final once a
        pool is fulfilled.
      </p>
      <h2>5. Liability</h2>
      <p>
        Our liability for any claim is limited to the amount paid for the affected pass. See the Refund policy for the
        Code Works Guarantee.
      </p>
      <h2>6. Governing law</h2>
      <p>These terms are governed by the laws of India. Disputes are subject to the courts of [City], India.</p>
    </Prose>
  );
}
