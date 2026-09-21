import { PhaseStub } from "@/components/ui/PhaseStub";
import { site } from "@/config/site";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PhaseStub title="Talk to us" phase={5}>
      <p className="text-sm text-ink-muted">
        Team pricing and reseller enquiries: email{" "}
        <a className="font-semibold text-primary" href={`mailto:${site.supportEmail}`}>
          {site.supportEmail}
        </a>
        .
      </p>
    </PhaseStub>
  );
}
