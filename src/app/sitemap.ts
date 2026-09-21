import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/home`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/checkout/direct?tier=pro`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/checkout/pool`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
