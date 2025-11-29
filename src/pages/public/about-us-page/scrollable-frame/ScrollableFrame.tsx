import styles from './ScrollableFrame.module.scss';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCard } from '../../../../components/public/program-card/ProgramCard';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import { ProgramsPageData } from '../../../../types/public/programs-page';
import { useTranslation } from 'react-i18next';
import { useDataFetch } from '../../../../hooks/common/use-data-fetch/useDataFetch';
import { LinearProgress } from '@mui/material';

const SWIPER_CONFIG = {
    slidesPerView: 1,
    breakpoints: {
        568: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1025: { slidesPerView: 3 },
    },
    showScrollbar: true,
} as const;

export const ScrollableFrame = () => {
    const { t } = useTranslation(['programsPage']);

    const { data, isLoading, error } = useDataFetch<ProgramsPageData | null>({
        initialData: null,
        fetchHandler: programPageDataFetch,
    });

    if (isLoading) {
        return (
            <div className={styles['swiper-loader']}>
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['error-message']} role="alert">
                {t('FAILED_TO_LOAD_THE_PROGRAMS')}
            </div>
        );
    }

    return (
        <>
            <div className={styles['swiper-block']}>
                <Swiper
                    items={data?.programsData ?? null}
                    {...SWIPER_CONFIG}
                    stylesModule={styles}
                    renderItem={(program) => <ProgramCard program={program} className="about-us-page-card" />}
                />
            </div>
            <div className={styles['scrollbar-block']}>
                <div className={styles['custom-scrollbar']} />
            </div>
        </>
    );
};
