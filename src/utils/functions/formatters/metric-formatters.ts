import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { parseFormattedNumber } from '@/utils/functions/formatters/format-number';
import { DEFAULT_LOCALE, getLocaleSettings } from '@/const/common/locales';
import { LocaleCurrency } from '@/const/common/currency';

export interface ResolvedMetricValue {
    value: number;
    usedLocalizedValue: boolean;
}

export const resolveMetricValue = (
    localizedValue: string | null | undefined,
    baseValue: number,
): ResolvedMetricValue => {
    const parsed = localizedValue ? parseFormattedNumber(localizedValue) : null;

    return parsed !== null
        ? { value: parsed, usedLocalizedValue: true }
        : { value: baseValue, usedLocalizedValue: false };
};

export const getAmountCurrency = (usedLocalizedValue: boolean, languageCode: string): LocaleCurrency =>
    getLocaleSettings(usedLocalizedValue ? languageCode : DEFAULT_LOCALE).currency;

const findEnglishLocalization = (metric: Metric) =>
    metric.localizations?.find(
        (l: any) => l?.language?.code === 'en' || l?.localizationInfoDto?.code === 'en' || l?.languageId === 2,
    );

export const getMetricName = (metric: Metric, language: 'UA' | 'EN' = 'UA') => {
    const code = language === 'UA' ? 'uk' : 'en';
    const targetLanguageId = language === 'UA' ? 1 : 2;

    return (
        metric.localizations?.find(
            (l: any) =>
                l?.language?.code === code ||
                l?.localizationInfoDto?.code === code ||
                l?.languageId === targetLanguageId,
        )?.name ?? metric.name
    );
};

export const formatMetricValue = (metric: Metric, language: 'UA' | 'EN' = 'UA') => {
    const { numberFormat } = getLocaleSettings(language === 'UA' ? 'uk' : 'en');

    let numValue = metric.value;

    if (metric.type === MetricType.Raised && language === 'EN') {
        numValue = resolveMetricValue(findEnglishLocalization(metric)?.value, metric.value).value;
    }

    return applyMetricPrefix(numValue.toLocaleString(numberFormat), metric.prefix);
};

export const getRaisedMetricCurrency = (metric: Metric, language: 'UA' | 'EN' = 'UA'): LocaleCurrency => {
    if (language === 'UA') return getLocaleSettings(DEFAULT_LOCALE).currency;

    const { usedLocalizedValue } = resolveMetricValue(findEnglishLocalization(metric)?.value, metric.value);

    return getAmountCurrency(usedLocalizedValue, 'en');
};

export const applyMetricPrefix = (value: string, prefix?: number | null): string => {
    switch (prefix) {
        case MetricPrefix.Plus:
            return `${value}+`;
        case MetricPrefix.Percent:
            return `${value}%`;
        default:
            return value;
    }
};
