import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { parseFormattedNumber } from '@/utils/functions/formatters/format-number';

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
    const locale = language === 'UA' ? 'uk-UA' : 'en-US';

    let numValue = metric.value;

    if (metric.type === MetricType.Raised && language === 'EN') {
        const enLoc = metric.localizations?.find(
            (l: any) => l?.language?.code === 'en' || l?.localizationInfoDto?.code === 'en' || l?.languageId === 2,
        );

        if (enLoc && enLoc.value) {
            const parsedValue = parseFormattedNumber(enLoc.value);
            if (parsedValue !== null) {
                numValue = parsedValue;
            }
        }
    }

    const valueStr = numValue.toLocaleString(locale);

    switch (metric.prefix) {
        case MetricPrefix.Plus:
            return `${valueStr}+`;
        case MetricPrefix.Percent:
            return `${valueStr}%`;
        default:
            return valueStr;
    }
};
