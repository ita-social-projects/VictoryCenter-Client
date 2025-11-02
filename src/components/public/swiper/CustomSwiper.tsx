import { useRef, useState } from 'react';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

import { ReactComponent as ArrowRight } from '../../../assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../../assets/icons/arrow-left.svg';

interface CustomSwiperProps<T> {
    items: T[] | null;
    renderItem: (item: T, index: number) => React.ReactNode;
    slidesPerView?: number;
    breakpoints?: Record<number, { slidesPerView: number }>;
    showScrollbar?: boolean;
}

export function CustomSwiper<T>({
    items,
    renderItem,
    slidesPerView = 1,
    breakpoints = {},
    showScrollbar = false,
}: CustomSwiperProps<T>) {
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
        <>
            {items && items.length > 0 ? (
                <>
                    <Swiper
                        modules={[Navigation, Pagination, ...(showScrollbar ? [Scrollbar] : [])]}
                        onSwiper={(swiper: SwiperClass) => {
                            swiperRef.current = swiper;
                            updateState(swiper);
                            swiper.on('slideChange', updateState);
                            swiper.on('resize', updateState);
                            swiper.on('reachBeginning', updateState);
                            swiper.on('reachEnd', updateState);
                            swiper.on('fromEdge', updateState);
                        }}
                        slidesPerView={slidesPerView}
                        scrollbar={{ draggable: true, el: '.custom-scrollbar' }}
                        breakpoints={breakpoints}
                    >
                        {items.map((item, index) => (
                            <SwiperSlide key={index}>{renderItem(item, index)}</SwiperSlide>
                        ))}
                    </Swiper>

                    {showButtons && (
                        <div className="button-container">
                            {canGoPrev && (
                                <button onClick={handlePrev} className="arrow-button arrow-left">
                                    <ArrowLeft className="arrow-icon" />
                                </button>
                            )}
                            {canGoNext && (
                                <button onClick={handleNext} className="arrow-button arrow-right">
                                    <ArrowRight className="arrow-icon" />
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : null}
        </>
    );
}
