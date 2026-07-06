import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import { DEFAULT_ENGLISH_LANGUAGE_ID, DEFAULT_UKRAINIAN_LANGUAGE_ID } from '@/const/common/locales';

export const metricPartners: Metric = {
    id: 1,
    name: 'Партнерів',
    value: 20,
    type: MetricType.Partners,
    prefix: MetricPrefix.Plus,
    isHidden: false,
    priority: 1,
    localizations: [
        {
            language: { id: DEFAULT_UKRAINIAN_LANGUAGE_ID, code: 'uk' },
            translationStatus: TranslationStatus.Relevant,
            name: 'Партнерів',
        },
        {
            language: { id: DEFAULT_ENGLISH_LANGUAGE_ID, code: 'en' },
            translationStatus: TranslationStatus.Relevant,
            name: 'Partners',
        },
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
    localizations: [{ languageId: DEFAULT_ENGLISH_LANGUAGE_ID, name: 'Raised', value: '125000' } as any],
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
