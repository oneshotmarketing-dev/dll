import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/seo";

// Indexable public routes. /courses/french is a 301 to /french-canada so it's
// intentionally excluded (canonical is /french-canada).
const paths = [
  "/",
  "/french-canada",
  "/about",
  "/book-assessment",
  "/contact",
  "/free-resources",
  "/courses/spanish",
  "/courses/german",
  "/courses/ielts",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: path === "/french-canada" ? "weekly" : "monthly",
    priority: path === "/" || path === "/french-canada" ? 1 : 0.7,
  }));
}
