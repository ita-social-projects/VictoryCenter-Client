import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { formatMetricValue, getMetricName } from './metric-formatters';

const normalizeSpaces = (value: string) => value.replace(/\u00a0/g, ' ');

describe('metric-formatters', () => {
    describe('getMetricName', () => {
        const baseMetric: Metric = {
            id: 1,
            name: 'Базова назва',
            value: 100,
            type: MetricType.Partners,
            prefix: MetricPrefix.None,
            isHidden: false,
            priority: 1,
            localizations: [],
        };

        it('should return base name if localizations array is empty or undefined', () => {
            expect(getMetricName(baseMetric)).toBe('Базова назва');
            expect(getMetricName({ ...baseMetric, localizations: undefined as any })).toBe('Базова назва');
        });

        it('should find UA localization by language.code', () => {
            const metric: Metric = {
                ...baseMetric,
                localizations: [{ name: 'Локалізована назва UA', language: { code: 'uk' } } as any],
            };
            expect(getMetricName(metric, 'UA')).toBe('Локалізована назва UA');
        });

        it('should find EN localization by localizationInfoDto.code', () => {
            const metric: Metric = {
                ...baseMetric,
                localizations: [{ name: 'Localized name EN', localizationInfoDto: { code: 'en' } } as any],
            };
            expect(getMetricName(metric, 'EN')).toBe('Localized name EN');
        });

        it('should find UA localization by languageId (1 for UA, 2 for EN)', () => {
            const metric: Metric = {
                ...baseMetric,
                localizations: [
                    { name: 'Назва по ID', languageId: 1 } as any,
                    { name: 'Name by ID', languageId: 2 } as any,
                ],
            };
            expect(getMetricName(metric, 'UA')).toBe('Назва по ID');
            expect(getMetricName(metric, 'EN')).toBe('Name by ID');
        });

        it('should default to UA if language is not explicitly provided', () => {
            const metric: Metric = {
                ...baseMetric,
                localizations: [{ name: 'Дефолтна UA', language: { code: 'uk' } } as any],
            };
            expect(getMetricName(metric)).toBe('Дефолтна UA');
        });

        it('should fall back to metric.name if requested localization is missing', () => {
            const metric: Metric = {
                ...baseMetric,
                name: 'Оригінал',
                localizations: [{ name: 'Тільки UA', languageId: 1 } as any],
            };
            expect(getMetricName(metric, 'EN')).toBe('Оригінал');
        });
    });

    describe('formatMetricValue', () => {
        const createMetric = (value: number, prefix?: MetricPrefix): Metric => ({
            id: 1,
            name: 'Test',
            value,
            type: MetricType.Partners,
            prefix: prefix ?? MetricPrefix.None,
            isHidden: false,
            priority: 1,
            localizations: [],
        });

        it('should format large numbers with spaces for UA locale (default)', () => {
            const metric = createMetric(1234567);
            expect(normalizeSpaces(formatMetricValue(metric))).toBe('1 234 567');
        });

        it('should format large numbers with commas for EN locale', () => {
            const metric = createMetric(1234567);
            expect(formatMetricValue(metric, 'EN')).toBe('1,234,567');
        });

        it('should append "+" suffix if MetricPrefix is Plus', () => {
            const metric = createMetric(500, MetricPrefix.Plus);
            expect(normalizeSpaces(formatMetricValue(metric, 'UA'))).toBe('500+');
            expect(formatMetricValue(metric, 'EN')).toBe('500+');
        });

        it('should append "%" suffix if MetricPrefix is Percent', () => {
            const metric = createMetric(99, MetricPrefix.Percent);
            expect(formatMetricValue(metric, 'UA')).toBe('99%');
            expect(formatMetricValue(metric, 'EN')).toBe('99%');
        });

        it('should not append any suffix for MetricPrefix.None/default', () => {
            const metric = createMetric(42); // Without prefix
            expect(formatMetricValue(metric, 'UA')).toBe('42');
        });

        it('should format numbers with decimals correctly based on locale', () => {
            const metric = createMetric(1000.5);
            expect(normalizeSpaces(formatMetricValue(metric, 'UA'))).toBe('1 000,5');
            expect(formatMetricValue(metric, 'EN')).toBe('1,000.5');
        });
    });
});
