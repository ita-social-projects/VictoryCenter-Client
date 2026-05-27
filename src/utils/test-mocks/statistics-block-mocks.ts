import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';

export const metricPartners: Metric = {
    id: 1,
    name: 'Партнерів',
    value: 20,
    type: MetricType.Partners,
    prefix: MetricPrefix.Plus,
    isHidden: false,
    priority: 1,
    localizations: [
        { language: { id: 1, code: 'uk' }, translationStatus: TranslationStatus.Relevant, name: 'Партнерів' },
        { language: { id: 2, code: 'en' }, translationStatus: TranslationStatus.Relevant, name: 'Partners' },
    ],
};

export const metricRaised: Metric = {
    id: 2,
    name: 'Зібрано',
    value: 5000000,
    type: MetricType.Raised,
    prefix: MetricPrefix.None,
    isHidden: false,
    priority: 2,
    localizations: [{ languageId: 2, name: 'Raised', value: '125000' } as any],
};

export const metricEngagement: Metric = {
    id: 3,
    name: 'Engagement',
    value: 50,
    type: MetricType.Programs,
    prefix: MetricPrefix.Percent,
    isHidden: false,
    priority: 2,
    localizations: [],
};
