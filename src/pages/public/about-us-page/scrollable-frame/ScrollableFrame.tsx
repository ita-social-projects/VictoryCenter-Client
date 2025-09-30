import './ScrollableFrame.scss';
import { useState, useEffect } from 'react';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';
import { PublishedProgram } from '../../../../types/public/programs-page';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCard } from './program-card/ProgramCard';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';

export const ScrollableFrame = () => {
    const [programData, setProgramData] = useState<PublishedProgram[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await programPageDataFetch();
                setProgramData(response.programData);
                setError(null);
            } catch {
                setError(FAILED_TO_LOAD_THE_PROGRAMS);
                setProgramData([]);
            }
        })();
    }, []);

    return (
        <div className="scroll-block">
            {error && (
                <div className="error-message" role="alert" style={{ color: 'red' }}>
                    {error}
                </div>
            )}
            <CustomSwiper
                items={programData}
                slidesPerView={1}
                breakpoints={{
                    568: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    912: { slidesPerView: 3 },
                }}
                renderItem={(program) => (
                    <>
                        <ProgramCard program={program} />
                    </>
                )}
                showScrollbar={true}
            />
            <div className="custom-scrollbar" />
        </div>
    );
};
