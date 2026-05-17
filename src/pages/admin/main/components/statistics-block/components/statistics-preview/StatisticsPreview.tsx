import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric, MetricPrefix } from '@/types/admin/main-page';
import styles from './StatisticsPreview.module.scss';

interface StatisticsPreviewProps {
    language: 'UA' | 'EN';
    onLanguageChange: (lang: 'UA' | 'EN') => void;
    metrics: Metric[];
    hiddenMetricIds: number[];
}

const getMetricName = (metric: Metric, language: 'UA' | 'EN') => {
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

const formatMetricValue = (metric: Metric, language: 'UA' | 'EN') => {
    const locale = language === 'UA' ? 'uk-UA' : 'en-US';
    const value = metric.value.toLocaleString(locale);
    switch (metric.prefix) {
        case MetricPrefix.Plus:
            return `${value}+`;
        case MetricPrefix.Percent:
            return `${value}%`;
        default:
            return value;
    }
};

export const StatisticsPreview = ({ language, onLanguageChange, metrics, hiddenMetricIds }: StatisticsPreviewProps) => {
    const visibleMetrics = metrics.filter((metric) => !hiddenMetricIds.includes(metric.id ?? 0));

    return (
        <div className={styles.preview}>
            <div className={styles.header}>
                <p className={styles.title}>{MAIN_PAGE_TEXT.BLOCKS.STATISTICS.PREVIEW_TITLE}</p>
                <div className={styles.toggle}>
                    <button
                        type="button"
                        onClick={() => onLanguageChange('UA')}
                        className={`${styles.tab} ${language === 'UA' ? styles.active : ''}`}
                    >
                        {MAIN_PAGE_TEXT.BLOCKS.STATISTICS.LANG.UKR}
                    </button>
                    <button
                        type="button"
                        onClick={() => onLanguageChange('EN')}
                        className={`${styles.tab} ${language === 'EN' ? styles.active : ''}`}
                    >
                        {MAIN_PAGE_TEXT.BLOCKS.STATISTICS.LANG.ENG}
                    </button>
                </div>
            </div>

            <div className={styles.panel}>
                {visibleMetrics.map((metric) => (
                    <div key={metric.id ?? metric.name} className={styles.metric}>
                        <p className={styles.value}>{formatMetricValue(metric, language)}</p>
                        <p className={styles.label}>{getMetricName(metric, language)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
