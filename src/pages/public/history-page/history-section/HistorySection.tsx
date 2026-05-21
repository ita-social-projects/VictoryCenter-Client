import React from 'react';
import { useTranslation } from 'react-i18next';
import { HistorySection as HistorySectionModel } from '@/types/public/history-page';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { useScrollAnimation } from '@/hooks/common/use-scroll-animation/useScrollAnimation';
import { HistoryQuadImages } from './HistoryQuadImages';
import { HistoryDualImages } from './HistoryDualImages';
import styles from './HistorySection.module.scss';

interface HistorySectionProps {
    section: HistorySectionModel;
    showYearLabel?: boolean;
}

const YEAR_PATTERN = /^(\d{4}(?:[–—-]\d{4})?)\s*[—–-]\s*/;
const YEAR_ONLY_PATTERN = /^(\d{4}(?:[–—-]\d{4})?)$/;

export const HistorySection = ({ section, showYearLabel = true }: HistorySectionProps) => {
    const { t } = useTranslation('historyPage');
    const { ref, isVisible } = useScrollAnimation();

    const titleContent = section.contents.find((c) => c.contentType === ContentType.Title);
    const descContent = section.contents.find((c) => c.contentType === ContentType.Description);

    const { title: localizedTitle } = useGetLocalization(titleContent?.localizations, {
        title: titleContent?.title,
    });
    const { description } = useGetLocalization(descContent?.localizations, {
        description: descContent?.description,
    });

    const rawTitle = localizedTitle ?? '';
    const images = section.contents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.image ?? null);

    const yearMatch = rawTitle.match(YEAR_PATTERN);
    const yearMatchStandalone = !yearMatch ? rawTitle.match(YEAR_ONLY_PATTERN) : null;
    const extractedYear = yearMatch?.[1] ?? yearMatchStandalone?.[1] ?? null;
    const yearLabel = extractedYear ? extractedYear + t('YEAR_SUFFIX') : null;
    const displayTitle = (yearMatch ? rawTitle.replace(yearMatch[0], '') : rawTitle).toUpperCase();

    const hasRealImages = images.some((img) => img !== null);
    const wrapperClass = `${styles['section-wrapper']} ${isVisible ? styles.visible : ''}`;

    const yearBadge = yearLabel && showYearLabel ? <span className={styles['year-label']}>{yearLabel}</span> : null;

    if (section.template === SectionTemplate.SingleImageRight) {
        const imageSrc = hasRealImages ? getImageSrc(images[0]) : null;
        return (
            <section ref={ref as React.RefObject<HTMLElement>} className={wrapperClass}>
                {yearBadge}
                <div className={styles['single-image-right']}>
                    <div className={styles['text-column']}>
                        {displayTitle && <h2 className={styles['section-title']}>{displayTitle}</h2>}
                        {description && <p className={styles['section-description']}>{description}</p>}
                    </div>
                    {imageSrc && (
                        <div className={styles['image-column']}>
                            <img src={imageSrc} alt="" className={styles['section-image']} loading="lazy" />
                        </div>
                    )}
                </div>
            </section>
        );
    }

    if (section.template === SectionTemplate.SingleImageTop && hasRealImages) {
        const imageSrc = getImageSrc(images[0]);
        return (
            <section ref={ref as React.RefObject<HTMLElement>} className={wrapperClass}>
                {yearBadge}
                {imageSrc && <img src={imageSrc} alt="" className={styles['full-width-image']} loading="lazy" />}
                <div className={styles['section-header']}>
                    <div className={styles['title-area']}>
                        {displayTitle && <h2 className={styles['section-title']}>{displayTitle}</h2>}
                    </div>
                    {description && <p className={styles['section-description']}>{description}</p>}
                </div>
            </section>
        );
    }

    return (
        <section ref={ref as React.RefObject<HTMLElement>} className={wrapperClass}>
            {yearBadge}
            {(displayTitle || description) && (
                <div className={styles['section-header']}>
                    <div className={styles['title-area']}>
                        {displayTitle && <h2 className={styles['section-title']}>{displayTitle}</h2>}
                    </div>
                    {description && <p className={styles['section-description']}>{description}</p>}
                </div>
            )}
            {hasRealImages && (
                <div className={styles['section-images']}>
                    {section.template === SectionTemplate.QuadImagesBottom && <HistoryQuadImages images={images} />}
                    {section.template === SectionTemplate.DualImagesBottom && <HistoryDualImages images={images} />}
                </div>
            )}
        </section>
    );
};
