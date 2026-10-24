import { redirect } from "next/navigation";

// Passes were retired from the storefront; keep the URL so old links land on the marketplace.
export default function PassesPage() {
  redirect("/market");
}
