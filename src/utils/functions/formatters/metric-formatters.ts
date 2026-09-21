import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { parseFormattedNumber } from '@/utils/functions/formatters/format-number';
import { NUMBER_FORMAT_LOCALES } from '@/const/common/locales';

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
    const locale = NUMBER_FORMAT_LOCALES[language === 'UA' ? 'uk' : 'en'];

    let numValue = metric.value;

    if (metric.type === MetricType.Raised && language === 'EN') {
        const enLoc = metric.localizations?.find(
            (l: any) => l?.language?.code === 'en' || l?.localizationInfoDto?.code === 'en' || l?.languageId === 2,
        );

        numValue = resolveMetricValue(enLoc?.value, metric.value).value;
    }

    const valueStr = numValue.toLocaleString(locale);

    return applyMetricPrefix(valueStr, metric.prefix);
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
