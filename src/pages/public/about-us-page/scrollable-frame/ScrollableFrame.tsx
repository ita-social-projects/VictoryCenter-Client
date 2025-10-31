import './ScrollableFrame.scss';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCard } from '../../../../components/public/program-card/ProgramCard';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import { ProgramsPageData } from '../../../../types/public/programs-page';
import { useTranslation } from 'react-i18next';
import { useDataFetch } from '../../../../hooks/common/use-data-fetch/useDataFetch';
import { LinearProgress } from '@mui/material';

export const ScrollableFrame = () => {
    const { t } = useTranslation(['programsPage']);

    const { data, isLoading, error } = useDataFetch<ProgramsPageData | null>({
        initialData: null,
        fetchHandler: programPageDataFetch,
    });

    if (isLoading) {
        return <LinearProgress />;
    }

    if (error) {
        return (
            <div className="error-message" role="alert">
                {t('FAILED_TO_LOAD_THE_PROGRAMS')}
            </div>
        );
    }

    return (
        <>
            <div className="swiper-block">
                <Swiper
                    items={data?.programsData ?? null}
                    slidesPerView={1}
                    breakpoints={{
                        568: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1025: { slidesPerView: 3 },
                    }}
                    renderItem={(program) => <ProgramCard program={program} className="about-us-page-card" />}
                    showScrollbar
                />
            </div>
            <div className="scrollbar-block">
                <div className="custom-scrollbar" />
            </div>
        </>
    );
};
