import type { MetadataRoute } from "next";

// Prototype for a hiring process: nothing here should be crawled.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
