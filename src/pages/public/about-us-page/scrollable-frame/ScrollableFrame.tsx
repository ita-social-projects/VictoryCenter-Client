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
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';
import { PublishedProgram } from '../../../../types/public/programs-page';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { ProgramCard } from './program-card/ProgramCard';

export const ScrollableFrame = () => {
    const [programData, setProgramData] = useState<PublishedProgram[]>([]);
    const [error, setError] = useState<string | null>(null);
    const swiperRef = useRef<SwiperClass | null>(null);
    const [canGoPrev, setCanGoPrev] = useState(false);
    const [canGoNext, setCanGoNext] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    const handlePrev = () => {
        if (canGoPrev) swiperRef.current?.slidePrev();
    };

    const handleNext = () => {
        if (canGoNext) swiperRef.current?.slideNext();
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
                onSwiper={(swiper: SwiperClass) => {
                    swiperRef.current = swiper;

                    const updateState = () => {
                        const perView =
                            typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;
                        const total = swiper.slides.length;

                        setCanGoPrev(!swiper.isBeginning);
                        setCanGoNext(!swiper.isEnd);
                        setShowButtons(total > perView);
                    };

                    updateState();
                    swiper.on('slideChange', updateState);
                    swiper.on('resize', updateState);
                    swiper.on('reachBeginning', updateState);
                    swiper.on('reachEnd', updateState);
                    swiper.on('fromEdge', updateState);
                }}
                slidesPerView={1}
                navigation={false}
                scrollbar={{ draggable: true, el: '.custom-scrollbar' }}
                loop={false}
                breakpoints={{
                    568: {
                        slidesPerView: 1,
                    },
                    768: {
                        slidesPerView: 2,
                    },
                    912: {
                        slidesPerView: 3,
                    },
                }}
            >
                {programData.map((item, index) => (
                    <SwiperSlide key={`${item.title}-${index}`}>
                        <ProgramCard program={item} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {showButtons && (
                <div className="button-container">
                    {canGoPrev && (
                        <button onClick={handlePrev} className="arrow-button arrow-left">
                            <img src={arrowLeftWhite} alt="" className="arrow-normal-state" />
                            <img src={arrowLeftBlack} alt="" className="arrow-hover-state" />
                        </button>
                    )}
                    {canGoNext && (
                        <button onClick={handleNext} className="arrow-button arrow-right">
                            <img src={arrowRightWhite} alt="" className="arrow-normal-state" />
                            <img src={arrowRightBlack} alt="" className="arrow-hover-state" />
                        </button>
                    )}
                </div>
            )}

            <div className="custom-scrollbar" />
        </div>
    );
};
