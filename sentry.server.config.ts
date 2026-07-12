// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://7e5a3515dc5ead49a415cabe02b99ff1@o4511717071585280.ingest.us.sentry.io/4511717101600768",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Skip Sentry's own OpenTelemetry setup — our instrumentation.ts already
  // starts a NodeSDK for Jaeger; without this, both try to register the
  // global OTel tracer and Sentry's registration silently blocks ours.
  skipOpenTelemetrySetup: true,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});