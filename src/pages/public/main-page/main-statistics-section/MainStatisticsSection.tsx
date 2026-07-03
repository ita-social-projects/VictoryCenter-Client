import React from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { useScrollAnimation } from '@/hooks/common/use-scroll-animation/useScrollAnimation';
import { useCounterAnimation } from '@/hooks/common/use-counter-animation/useCounterAnimation';
import { PublicImpactStatisticDto, PublicMetricDto, MetricPrefix, MetricType } from '@/types/public/main-page';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import fallbackImage from '@/assets/images/two-horses-gray.webp';
import styles from './MainStatisticsSection.module.scss';

interface MainStatisticsSectionProps {
    impactStatistics: PublicImpactStatisticDto | null | undefined;
}

const getMetricLocalizedName = (metric: PublicMetricDto, currentLanguage: string): string => {
    const loc = metric.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.name ?? metric.name ?? '';
};

const formatMetricValue = (value: number, prefix: MetricPrefix | null | undefined, type: MetricType): string => {
    const formatted = value.toLocaleString('uk-UA');
    const prefixStr = prefix === MetricPrefix.Plus ? '+' : prefix === MetricPrefix.Percent ? '%' : '';
    const suffix = type === MetricType.Raised ? ' грн' : '';
    return `${formatted}${prefixStr}${suffix}`;
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
    const displayValue = useCounterAnimation(metric.value, isVisible);

    const name = getMetricLocalizedName(metric, currentLanguage);
    const valueText = formatMetricValue(displayValue, metric.prefix, metric.type);
    const finalValueText = formatMetricValue(metric.value, metric.prefix, metric.type);

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
