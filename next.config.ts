import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withSentryConfig(nextConfig, {
  org: "resilentcommerce",
  project: "aethermed",

  // Suppresses source map uploading logs during build
  silent: true,
});