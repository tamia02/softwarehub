import { Prose } from "@/components/ui/Prose";
import { site } from "@/config/site";

export const metadata = { title: "Privacy policy" };

/** DRAFT — placeholder structure; align with DPDP Act 2023 obligations before launch. */
export default function PrivacyPage() {
  return (
    <Prose title="Privacy policy" updated="21 September 2026 (draft)">
      <h2>1. What we collect</h2>
      <ul>
        <li>Account details: name, email, phone number (for OTP sign-in and code delivery).</li>
        <li>Order and payment metadata from our payment gateway. We never store card numbers.</li>
        <li>Product analytics (page views, funnel events) to improve the site.</li>
      </ul>
      <h2>2. How we use it</h2>
      <p>
        To deliver activation codes, run pools and refunds, issue GST invoices, prevent fraud, and send service
        messages. We do not sell personal data.
      </p>
      <h2>3. Activation codes</h2>
      <p>Codes are stored only as salted hashes. Plaintext codes are shown once and never logged.</p>
      <h2>4. Sharing</h2>
      <p>
        Vendors receive only what is needed to fulfil a claim. Service providers (payments, email, SMS, hosting,
        analytics) process data on our behalf under contract.
      </p>
      <h2>5. Your rights</h2>
      <p>
        You can access, correct or delete your data by emailing {site.supportEmail}. We respond within 30 days.
      </p>
    </Prose>
  );
}
