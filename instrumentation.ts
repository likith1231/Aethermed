import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');

    // OpenTelemetry -> Jaeger. Runs alongside Sentry, not instead of it:
    // Sentry catches/reports application errors; this exports distributed
    // traces (request timing broken down by internal calls, including the
    // Prisma/Neon query time) to Jaeger for the tracing story.
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import(
      '@opentelemetry/auto-instrumentations-node'
    );
    const { OTLPTraceExporter } = await import(
      '@opentelemetry/exporter-trace-otlp-http'
    );

    const otelSdk = new NodeSDK({
      serviceName: 'aethermed',
      traceExporter: new OTLPTraceExporter({
        // K8s internal DNS name — only resolves from inside the cluster.
        url:
          process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
          'http://jaeger-otlp.observability.svc.cluster.local:4318/v1/traces',
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });

    otelSdk.start();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
