import {ProgramCard} from '../../../pages/program-page/program-page/program-section/program-card/ProgramCard';
import {Navigation, Pagination, Scrollbar} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';
import {programPageDataFetch} from '../../../services/data-fetch/program-page-data-fetch/program-page-data-fetch';
import React, {useState, useEffect, useRef} from 'react';
import {SwiperClass} from 'swiper/react';
import {Program} from '../../../types/ProgramPage';
import arrowRight from '../../../assets/about-us-images/icons/arrow-right.png';
import arrowLeft from '../../../assets/about-us-images/icons/arrow-left.png';
import arrowRightBlack from '../../../assets/about-us-images/icons/arrow-right-black.png';
import arrowLeftBlack from '../../../assets/about-us-images/icons/arrow-left-black.png';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './scrollable-frame.scss'

export const ScrollableFrame = () => {

    const [programData, setProgramData] = useState<Program[]>([]);
    const [error, setError] = useState<string | null>(null);
    const swiperRef = useRef<any>(null);

    const handlePrev = () => {
        swiperRef.current?.slidePrev();
    };

    const handleNext = () => {
        swiperRef.current?.slideNext();
    };

    useEffect(() => {
        (async() => {
            try{
                const response = await programPageDataFetch();
                setProgramData(response.programData);
                setError(null);
            }
            catch{
                setError('Не вдалося завантажити дані програм. Будь-ласка спробуйте пізніше.');
                setProgramData([]);
            }
        })();
    }, []);
    
    return (
        <div className="scroll-block">
            {error && (
                <div className="error-message" role="alert" style={{ color: "red" }}>
                    {error}
                </div>
            )}
            <Swiper modules={[Navigation, Pagination, Scrollbar]}
                    onSwiper={(swiper: SwiperClass) => (swiperRef.current = swiper)}
                    slidesPerView={3}
                    navigation={false}
                    scrollbar={{draggable: true, el: '.custom-scrollbar',}}>
                {programData.map((item, index) => (
                    <SwiperSlide key={index}>
                        <ProgramCard key={index} program={item}/>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="button-container">
                <button onClick={handlePrev} className="arrow-button">
                    <img src={arrowLeft} alt="" className="arrow-normal-state"/>
                    <img src={arrowLeftBlack} alt="" className="arrow-hover-state"/>
                </button>
                <button onClick={handleNext} className="arrow-button">
                    <img src={arrowRight} alt="" className="arrow-normal-state"/>
                    <img src={arrowRightBlack} alt="" className="arrow-hover-state"/>
                </button>
            </div>
            
            <div className="custom-scrollbar" />
        </div>
    );
};
