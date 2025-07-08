import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes } from "@opentelemetry/resources";

const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: "victory-center",
});

const exporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

const spanProcessor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource,
  spanProcessors: [spanProcessor],
});

provider.register();

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: [/.*/],
      applyCustomAttributesOnSpan: (span, request, response) => {
        if (request) {
          span.setAttribute("http.method", request.method);
        }
        if (response) {
          span.setAttribute("http.response.status_code", response.status);
          if (response.status >= 400) {
            span.setStatus({ code: 2 });
            span.setAttribute("error", true);
          }
        }
      },
    }),
    new DocumentLoadInstrumentation(),
  ],
});
