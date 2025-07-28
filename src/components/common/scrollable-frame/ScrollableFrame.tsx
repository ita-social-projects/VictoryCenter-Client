import { ProgramCard } from '../../../pages/program-page/program-page/program-section/program-card/ProgramCard';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { programPageDataFetch } from '../../../services/data-fetch/program-page-data-fetch/program-page-data-fetch';
import React, { useState, useEffect, useRef } from 'react';
import { Program } from '../../../types/public/ProgramPage';
import arrowRight from '../../../assets/about-us-images/icons/arrow-right.png';
import arrowLeft from '../../../assets/about-us-images/icons/arrow-left.png';
import arrowRightBlack from '../../../assets/about-us-images/icons/arrow-right-black.png';
import arrowLeftBlack from '../../../assets/about-us-images/icons/arrow-left-black.png';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './scrollable-frame.scss';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../const/program-page/program-page';

export const ScrollableFrame = () => {
    const [programData, setProgramData] = useState<Program[]>([]);
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
                    <img src={arrowLeft} alt="" className="arrow-normal-state" />
                    <img src={arrowLeftBlack} alt="" className="arrow-hover-state" />
                </button>
                <button onClick={handleNext} className="arrow-button">
                    <img src={arrowRight} alt="" className="arrow-normal-state" />
                    <img src={arrowRightBlack} alt="" className="arrow-hover-state" />
                </button>
            </div>

            <div className="custom-scrollbar" />
        </div>
    );
};
