// The previous backend returns the legacy `type` (Raised = 2) instead of `kind` and requires `type` on publish.
// Remove together with the backend's legacy Type column (contract step of #4801).
const LEGACY_RAISED_TYPE = 2;
const STANDARD_KIND = 0;
const RAISED_FUNDS_KIND = 1;

export interface MetricKindFields {
    kind?: number | null;
    type?: number | null;
}

export const resolveMetricKind = ({ kind, type }: MetricKindFields): number =>
    kind ?? (type === LEGACY_RAISED_TYPE ? RAISED_FUNDS_KIND : STANDARD_KIND);
