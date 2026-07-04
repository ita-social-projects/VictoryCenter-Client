import React from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper } from '@/components/public/swiper/Swiper';
import { ProgramCard } from '@/components/public/program-card/ProgramCard';
import { ProgramCardSkeleton } from '@/components/public/program-card/ProgramCardSkeleton';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { programPageDataFetch } from '@/services/api/public/programs/programs-api';
import { ProgramsPageData } from '@/types/public/programs-page';
import styles from './MainProgramsSection.module.scss';

const SWIPER_NAVIGATION_CONFIG = {
    next: {
        className: styles.right,
    },
};

export const MainProgramsSection: React.FC = () => {
    const { t } = useTranslation('programsPage');

    const { data, isLoading, error, refetch } = useDataFetch<ProgramsPageData | null>({
        initialData: null,
        fetchHandler: programPageDataFetch,
    });

    return (
        <section className={styles.root}>
            <h2 className={styles.heading}>{t('PROGRAMS')}</h2>
            <div className={styles['swiper-wrapper']}>
                {isLoading && (
                    <div className={styles['skeleton-grid']}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={styles['swiper-slide']}>
                                <ProgramCardSkeleton />
                            </div>
                        ))}
                    </div>
                )}
                {error && (
                    <div className={styles.error} role="alert">
                        <p>{t('FAILED_TO_LOAD_THE_PROGRAMS')}</p>
                        <button className={styles['retry-button']} onClick={refetch}>
                            {t('RETRY')}
                        </button>
                    </div>
                )}
                {!isLoading && !error && (
                    <Swiper
                        items={data?.programsData ?? null}
                        renderItem={(program) => <ProgramCard program={program} variant="program" />}
                        showScrollbar={{
                            isVisible: true,
                            className: styles.line,
                            classNameDrag: styles.drag,
                        }}
                        classNameSwiperSlide={styles['swiper-slide']}
                        navigationButtons={SWIPER_NAVIGATION_CONFIG}
                    />
                )}
            </div>
            <div className={styles.scrollbar}>
                <div className={styles.line} />
            </div>
        </section>
    );
};
