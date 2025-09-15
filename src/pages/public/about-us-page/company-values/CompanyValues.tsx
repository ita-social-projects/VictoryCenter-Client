import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { useState, useRef } from 'react';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import arrowRightWhite from '../../../../assets/icons/arrow-right-white.svg';
import arrowLeftWhite from '../../../../assets/icons/arrow-left-white.svg';
import arrowRightBlack from '../../../../assets/icons/arrow-right.svg';
import arrowLeftBlack from '../../../../assets/icons/arrow-left.svg';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import './CompanyValues.scss';

export const CompanyValues = () => {
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
    const chunkedValues = ABOUT_US_DATA.VALUE_ITEMS.reduce(
        (acc, _, i) => {
            if (i % 3 === 0) acc.push(ABOUT_US_DATA.VALUE_ITEMS.slice(i, i + 3));
            return acc;
        },
        [] as (typeof ABOUT_US_DATA.VALUE_ITEMS)[],
    );

    return (
        <div className="values-block">
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
                    1440: {
                        slidesPerView: 3,
                    },
                }}
            >
                {chunkedValues.map((group, groupIndex) => (
                    <SwiperSlide key={groupIndex}>
                        {groupIndex === 0 && (
                            <div className="values-title">
                                <h2>{ABOUT_US_DATA.OUR_VALUES}</h2>
                            </div>
                        )}
                        <div className={`value-card card-${groupIndex + 1}`}>
                            {group.map((val, index) => (
                                <div className="value-item" key={`${val.NAME}-${index}`}>
                                    <h3 className="value-name">{val.NAME}</h3>
                                    <div className="value-description">{val.DESCRIPTION}</div>
                                </div>
                            ))}
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
    );
};
