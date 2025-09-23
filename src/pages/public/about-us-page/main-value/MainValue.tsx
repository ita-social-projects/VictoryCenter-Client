import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { useState, useRef } from 'react';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import './MainValue.scss';
import arrowRightWhite from '../../../../assets/icons/arrow-right-white.svg';
import arrowLeftWhite from '../../../../assets/icons/arrow-left-white.svg';
import arrowRightBlack from '../../../../assets/icons/arrow-right.svg';
import arrowLeftBlack from '../../../../assets/icons/arrow-left.svg';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

export const MainValues = () => {
    const swiperRef = useRef<SwiperClass | null>(null);
    const [canGoPrev, setCanGoPrev] = useState(false);
    const [canGoNext, setCanGoNext] = useState(true);
    const [showButtons, setShowButtons] = useState(false);
    const handlePrev = () => swiperRef.current?.slidePrev();
    const handleNext = () => swiperRef.current?.slideNext();
    const updateState = (swiper: SwiperClass) => {
        const perView = typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;
        const total = swiper.slides.length;
        setCanGoPrev(!swiper.isBeginning);
        setCanGoNext(!swiper.isEnd);
        setShowButtons(total > perView);
    };

    return (
        <div className="main-values-block">
            <div className="main-values-title">
                <h2>
                    {ABOUT_US_DATA.MAIN_VALUE.FIRST_PART} <br />
                    <span>{ABOUT_US_DATA.MAIN_VALUE.FIRST_HIGHLIGHT}</span> <br />
                    {ABOUT_US_DATA.MAIN_VALUE.MIDDLE_PART} <br />
                    <span>{ABOUT_US_DATA.MAIN_VALUE.SECOND_HIGHLIGHT}</span>
                </h2>
            </div>

            <div className="people-block">
                <Swiper
                    modules={[Navigation, Pagination]}
                    onSwiper={(swiper: SwiperClass) => {
                        swiperRef.current = swiper;
                        updateState(swiper);
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
                            slidesPerView: 2,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        912: {
                            slidesPerView: 4,
                        },
                    }}
                >
                    {ABOUT_US_DATA.PEOPLE_DATA.map(({ IMG, ALT, INFO }, index) => (
                        <SwiperSlide key={`${ALT}-${index}`}>
                            <div className={`people-card card-${index + 1}`}>
                                <img src={IMG} alt={ALT} />
                                <p className="people-info">{INFO}</p>
                            </div>
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
            </div>
            <div className="summary-block">
                <h3 className="summary-text">{ABOUT_US_DATA.MAIN_VALUE_DETAILS}</h3>
            </div>
        </div>
    );
};
