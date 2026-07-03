import React, { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { useScrollAnimation } from '@/hooks/common/use-scroll-animation/useScrollAnimation';
import { PublicImpactStatisticDto, PublicMetricDto, MetricPrefix, MetricType } from '@/types/public/main-page';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import fallbackImage from '@/assets/images/two-horses-gray.webp';
import styles from './MainStatisticsSection.module.scss';

interface MainStatisticsSectionProps {
    impactStatistics: PublicImpactStatisticDto | null | undefined;
}

const COUNTER_DURATION_MS = 1800;
const COUNTER_STEPS = 60;

const getMetricLocalizedName = (metric: PublicMetricDto, currentLanguage: string): string => {
    const loc = metric.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.name ?? metric.name ?? '';
};

const formatValue = (metric: PublicMetricDto, displayValue: number): string => {
    const suffix = metric.type === MetricType.Raised ? ' грн' : '';
    const prefix = metric.prefix === MetricPrefix.Plus ? '+' : metric.prefix === MetricPrefix.Percent ? '%' : '';
    const formatted = displayValue.toLocaleString('uk-UA');
    if (metric.prefix === MetricPrefix.Percent) {
        return `${formatted}${prefix}${suffix}`;
    }
    return `${formatted}${prefix}${suffix}`;
};

interface AnimatedCounterProps {
    metric: PublicMetricDto;
    currentLanguage: string;
    isVisible: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ metric, currentLanguage, isVisible }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const animatedRef = useRef(false);

    useEffect(() => {
        if (!isVisible || animatedRef.current) return;
        animatedRef.current = true;

        const target = metric.value;
        const stepValue = target / COUNTER_STEPS;
        const stepDuration = COUNTER_DURATION_MS / COUNTER_STEPS;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step += 1;
            current = Math.min(Math.round(stepValue * step), target);
            setDisplayValue(current);
            if (current >= target) {
                clearInterval(timer);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [isVisible, metric.value]);

    const name = getMetricLocalizedName(metric, currentLanguage);
    const prefix = metric.prefix === MetricPrefix.Plus ? '+' : metric.prefix === MetricPrefix.Percent ? '%' : '';
    const suffix = metric.type === MetricType.Raised ? ' грн' : '';
    const formatted = displayValue.toLocaleString('uk-UA');
    const valueText =
        metric.prefix === MetricPrefix.Percent ? `${formatted}${prefix}${suffix}` : `${formatted}${prefix}${suffix}`;

    return (
        <div className={styles.metric} role="figure" aria-label={`${name}: ${formatValue(metric, metric.value)}`}>
            <span className={styles['metric-value']} aria-hidden="true">
                {valueText}
            </span>
            <span className={styles['metric-name']}>{name}</span>
        </div>
    );
};

const getStatisticTitle = (statistic: PublicImpactStatisticDto, currentLanguage: string): string => {
    const loc = statistic.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.title ?? statistic.title ?? '';
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
                    <img src={imageSrc} alt="" className={styles.image} aria-hidden="true" />
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
