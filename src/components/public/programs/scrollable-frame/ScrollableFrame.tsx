import './ScrollableFrame.scss';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import arrowRightWhite from '../../../../assets/icons/arrow-right-white.svg';
import arrowLeftWhite from '../../../../assets/icons/arrow-left-white.svg';
import arrowRightBlack from '../../../../assets/icons/arrow-right.svg';
import arrowLeftBlack from '../../../../assets/icons/arrow-left.svg';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { programPageDataFetch } from '../../../../utils/mock-data/public/program-page/programs-page';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';
import { ProgramCard } from '../../../../pages/public/program-page/program-section/program-card/ProgramCard';
import { PublishedProgram } from '../../../../types/public/program-page';

export const ScrollableFrame = () => {
    const [programData, setProgramData] = useState<PublishedProgram[]>([]);
    const [error, setError] = useState<string | null>(null);
    const swiperRef = useRef<SwiperClass | null>(null);

    const handlePrev = () => {
        swiperRef.current?.slidePrev();
    };

    const handleNext = () => {
        swiperRef.current?.slideNext();
    };

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
                    <img src={arrowLeftWhite} alt="" className="arrow-normal-state" />
                    <img src={arrowLeftBlack} alt="" className="arrow-hover-state" />
                </button>
                <button onClick={handleNext} className="arrow-button">
                    <img src={arrowRightWhite} alt="" className="arrow-normal-state" />
                    <img src={arrowRightBlack} alt="" className="arrow-hover-state" />
                </button>
            </div>

            <div className="custom-scrollbar" />
        </div>
    );
};
