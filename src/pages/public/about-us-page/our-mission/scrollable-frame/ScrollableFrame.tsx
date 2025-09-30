import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ReactComponent as ArrowRight } from '../../../../../assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../../../../assets/icons/arrow-left.svg';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { PublishedProgram } from '../../../../../types/public/programs-page';
import { programPageDataFetch } from '../../../../../services/api/public/programs/programs-api';
import { ProgramCard } from '../../../programs-page/programs-section/program-card/ProgramCard';
import { useTranslation } from 'react-i18next';
import './ScrollableFrame.scss';

export const ScrollableFrame = () => {
    const { t } = useTranslation('programsPage');

    const [programData, setProgramData] = useState<PublishedProgram[]>([]);
    const [error, setError] = useState<string | null>(null);
    const swiperRef = useRef<SwiperClass | null>(null);

    const handlePrev = () => {
        swiperRef.current?.slidePrev();
    };

    const handleNext = () => {
        swiperRef.current?.slideNext();
    };

    // will fetch program data in a selected language later
    const fetchProgramData = useCallback(async () => {
        try {
            const response = await programPageDataFetch();
            setProgramData(response.programData);
            setError(null);
        } catch {
            setError(t('FAILED_TO_LOAD_THE_PROGRAMS'));
            setProgramData([]);
        }
    }, [t]);

    useEffect(() => {
        fetchProgramData();
    }, [fetchProgramData]);

    return (
        <div className="scroll-block">
            {error && (
                <div className="error-message" role="alert" style={{ color: 'red' }}>
                    {error}
                </div>
            )}
            <Swiper
                modules={[Navigation, Pagination, Scrollbar]}
                onSwiper={(swiper: SwiperClass) => (swiperRef.current = swiper)}
                slidesPerView={3}
                navigation={false}
                scrollbar={{ draggable: true, el: '.custom-scrollbar' }}
            >
                {programData.map((item, index) => (
                    <SwiperSlide key={`${item.title}-${index}`}>
                        <ProgramCard program={item} />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="button-container">
                <button onClick={handlePrev} className="arrow-button">
                    <ArrowLeft className="arrow-icon" />
                </button>
                <button onClick={handleNext} className="arrow-button">
                    <ArrowRight className="arrow-icon" />
                </button>
            </div>

            <div className="custom-scrollbar" />
        </div>
    );
};
