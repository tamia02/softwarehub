import { redirect } from "next/navigation";

// The marketplace is the customer landing now.
export default function HomePage() {
  redirect("/market");
}
