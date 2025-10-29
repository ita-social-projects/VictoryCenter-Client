import './ScrollableFrame.scss';
import { useState, useEffect } from 'react';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCard } from '../../../../components/public/program-card/ProgramCard';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import { PublishedProgramDto } from '../../../../types/public/programs-page';

export const ScrollableFrame = () => {
    const [programData, setProgramData] = useState<PublishedProgramDto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await programPageDataFetch();
                setProgramData(response.programsData);
                setError(null);
            } catch {
                setError(FAILED_TO_LOAD_THE_PROGRAMS);
                setProgramData([]);
            }
        })();
    }, []);

    return (
        <>
            {error ? (
                <div className="error-message" role="alert">
                    {error}
                </div>
            ) : (
                <>
                    <div className="swiper-block">
                        <Swiper
                            items={programData}
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
            )}
        </>
    );
};
