import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');

    const { diag, DiagConsoleLogger, DiagLogLevel } = await import('@opentelemetry/api');
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

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