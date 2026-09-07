import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric, MetricType } from '@/types/admin/main-page';
import { formatMetricValue, getMetricName } from '@/utils/functions/formatters/metric-formatters';
import styles from './StatisticsPreview.module.scss';

interface StatisticsPreviewProps {
    language: 'UA' | 'EN';
    onLanguageChange: (lang: 'UA' | 'EN') => void;
    metrics: Metric[];
    hiddenMetricIds: number[];
}

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
                {visibleMetrics.map((metric) => {
                    let value = formatMetricValue(metric, language);

                    if (metric.type === MetricType.Raised) {
                        value =
                            language === 'UA'
                                ? `${value} ${MAIN_PAGE_TEXT.BLOCKS.STATISTICS.CURRENCY_UAH}`
                                : `${MAIN_PAGE_TEXT.BLOCKS.STATISTICS.CURRENCY_USD}${value.replace(/,/g, ' ')}`;
                    }

                    return (
                        <div key={metric.id ?? metric.name} className={styles.metric}>
                            <p className={styles.value}>{value}</p>
                            <p className={styles.label}>{getMetricName(metric, language)}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
