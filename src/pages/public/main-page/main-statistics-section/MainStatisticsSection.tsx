import React from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { useScrollAnimation } from '@/hooks/common/use-scroll-animation/useScrollAnimation';
import { useCounterAnimation } from '@/hooks/common/use-counter-animation/useCounterAnimation';
import { PublicImpactStatisticDto, PublicMetricDto, MetricPrefix, MetricType } from '@/types/public/main-page';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { parseFormattedNumber } from '@/utils/functions/formatters/format-number';
import fallbackImage from '@/assets/images/two-horses-gray.webp';
import styles from './MainStatisticsSection.module.scss';

const UAH_LABEL = 'грн';
const USD_LABEL = '$';

interface MainStatisticsSectionProps {
    impactStatistics: PublicImpactStatisticDto | null | undefined;
}

const getMetricLocalizedName = (metric: PublicMetricDto, currentLanguage: string): string => {
    const loc = metric.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.name ?? metric.name ?? '';
};

const getUsdValue = (metric: PublicMetricDto, currentLanguage: string): number | null => {
    if (metric.type !== MetricType.Raised || currentLanguage !== 'en') return null;

    const loc = metric.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.value ? parseFormattedNumber(loc.value) : null;
};

const formatMetricValue = (
    value: number,
    prefix: MetricPrefix | null | undefined,
    type: MetricType,
    isUsd: boolean,
): string => {
    const formatted = value.toLocaleString(isUsd ? 'en-US' : 'uk-UA');
    const prefixStr = prefix === MetricPrefix.Plus ? '+' : prefix === MetricPrefix.Percent ? '%' : '';

    if (type !== MetricType.Raised) return `${formatted}${prefixStr}`;

    return isUsd ? `${USD_LABEL}${formatted}${prefixStr}` : `${formatted}${prefixStr} ${UAH_LABEL}`;
};

const getStatisticTitle = (statistic: PublicImpactStatisticDto, currentLanguage: string): string => {
    const loc = statistic.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.title ?? statistic.title ?? '';
};

interface AnimatedCounterProps {
    metric: PublicMetricDto;
    currentLanguage: string;
    isVisible: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ metric, currentLanguage, isVisible }) => {
    const usdValue = getUsdValue(metric, currentLanguage);
    const isUsd = usdValue !== null;
    const targetValue = usdValue ?? metric.value;
    const displayValue = useCounterAnimation(targetValue, isVisible);

    const name = getMetricLocalizedName(metric, currentLanguage);
    const valueText = formatMetricValue(displayValue, metric.prefix, metric.type, isUsd);
    const finalValueText = formatMetricValue(targetValue, metric.prefix, metric.type, isUsd);

    return (
        <div className={styles.metric} role="figure" aria-label={`${name}: ${finalValueText}`}>
            <span className={styles['metric-value']} aria-hidden="true">
                {valueText}
            </span>
            <span className={styles['metric-name']}>{name}</span>
        </div>
    );
};

export const MainStatisticsSection: React.FC<MainStatisticsSectionProps> = ({ impactStatistics }) => {
    const { currentLanguage } = useLocale();
    const { ref, isVisible } = useScrollAnimation(0.2);

    if (!impactStatistics) return null;

    const visibleMetrics = (impactStatistics.metrics ?? []).sort((a, b) => a.priority - b.priority);

    if (visibleMetrics.length === 0) return null;

    const title = getStatisticTitle(impactStatistics, currentLanguage);
    const imageSrc = getImageSrc(impactStatistics.image) || fallbackImage;

    return (
        <section
            className={styles.root}
            ref={ref as React.RefObject<HTMLElement>}
            aria-label={title || 'Impact statistics'}
        >
            {imageSrc && (
                <div className={styles['image-wrapper']}>
                    <img src={imageSrc} alt="" className={styles.image} loading="lazy" aria-hidden="true" />
                </div>
            )}
            <div className={styles['content-block']}>
                {title && <h2 className={styles.title}>{title}</h2>}
                <div className={styles['metrics-grid']}>
                    {visibleMetrics.map((metric) => (
                        <AnimatedCounter
                            key={metric.id}
                            metric={metric}
                            currentLanguage={currentLanguage}
                            isVisible={isVisible}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
