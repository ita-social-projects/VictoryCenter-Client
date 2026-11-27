import { MetricKind } from '@/types/admin/main-page';
import { resolveMetricKind } from '@/utils/functions/mappers/common/metrics/metric-kind-mappers';

describe('resolveMetricKind', () => {
    it.each([
        [{ kind: MetricKind.RaisedFunds }, MetricKind.RaisedFunds],
        [{ kind: MetricKind.Standard, type: 2 }, MetricKind.Standard],
        [{ type: 2 }, MetricKind.RaisedFunds],
        [{ type: 0 }, MetricKind.Standard],
        [{ type: 1 }, MetricKind.Standard],
        [{ type: 3 }, MetricKind.Standard],
        [{ kind: null, type: 2 }, MetricKind.RaisedFunds],
        [{}, MetricKind.Standard],
    ])('resolves %j to kind %s', (metric, expected) => {
        expect(resolveMetricKind(metric)).toBe(expected);
    });
});
