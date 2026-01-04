import { useRef, useState, useCallback, useMemo } from 'react';
import { Swiper as SwiperReact, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';
import { ReactComponent as ChevronRight } from '@/assets/icons/chevron-right.svg';
import { ReactComponent as ChevronLeft } from '@/assets/icons/chevron-left.svg';

interface SwiperProps<T> {
    items: T[] | null;
    renderItem: (item: T, index: number) => React.ReactNode;
    slidesPerView?: number;
    breakpoints?: Record<number, { slidesPerView: number }>;
    showScrollbar?: boolean;
    onSlideChange?: (activeIndex: number) => void;
    className?: string;
    useChevrons?: boolean;
}

export function Swiper<T>({
    items,
    renderItem,
    slidesPerView = 1,
    breakpoints = {},
    showScrollbar = false,
    onSlideChange,
    className = '',
    useChevrons = false,
}: SwiperProps<T>) {
    const swiperRef = useRef<SwiperClass | null>(null);
    const [isPrevEnabled, setIsPrevEnabled] = useState(false);
    const [isNextEnabled, setIsNextEnabled] = useState(true);

    const handlePrev = useCallback(() => {
        swiperRef.current?.slidePrev();
    }, []);
    const handleNext = useCallback(() => {
        swiperRef.current?.slideNext();
    }, []);

    const handleInit = useCallback(
        (swiper: SwiperClass) => {
            swiperRef.current = swiper;
            setIsPrevEnabled(!swiper.isBeginning);
            setIsNextEnabled(!swiper.isEnd);
            onSlideChange?.(swiper.activeIndex);
        },
        [onSlideChange],
    );

    const handleResize = useCallback((swiper: SwiperClass) => {
        setIsPrevEnabled(!swiper.isBeginning);
        setIsNextEnabled(!swiper.isEnd);
    }, []);

    const handleReachBeginning = useCallback(() => setIsPrevEnabled(false), []);

    const handleReachEnd = useCallback(() => setIsNextEnabled(false), []);

    const handleFromEdge = useCallback(() => {
        setIsPrevEnabled(true);
        setIsNextEnabled(true);
    }, []);

    const handleSlideChangeInternal = useCallback(
        (swiper: SwiperClass) => {
            setIsPrevEnabled(!swiper.isBeginning);
            setIsNextEnabled(!swiper.isEnd);
            onSlideChange?.(swiper.activeIndex);
        },
        [onSlideChange],
    );

    const swiperModules = useMemo(() => {
        const modules = [Navigation, Pagination];
        if (showScrollbar) {
            modules.push(Scrollbar);
        }
        return modules;
    }, [showScrollbar]);

    if (!items || items.length === 0) {
        return null;
    }

    const LeftIcon = useChevrons ? ChevronLeft : ArrowLeft;
    const RightIcon = useChevrons ? ChevronRight : ArrowRight;

    return (
        <>
            <SwiperReact
                modules={swiperModules}
                onInit={handleInit}
                onSlideChange={handleSlideChangeInternal}
                onResize={handleResize}
                onReachBeginning={handleReachBeginning}
                onReachEnd={handleReachEnd}
                onFromEdge={handleFromEdge}
                slidesPerView={slidesPerView}
                scrollbar={{ draggable: true, el: '.custom-scrollbar' }}
                breakpoints={breakpoints}
            >
                {items.map((item, index) => (
                    <SwiperSlide key={index}>{renderItem(item, index)}</SwiperSlide>
                ))}
            </SwiperReact>
            <div className={`button-container ${className}`}>
                <button
                    type="button"
                    onClick={handlePrev}
                    className="arrow-button arrow-left"
                    disabled={!isPrevEnabled}
                    title="Previous slide"
                    aria-label="Previous slide"
                >
                    <LeftIcon className="arrow-icon" />
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="arrow-button arrow-right"
                    disabled={!isNextEnabled}
                    title="Next slide"
                    aria-label="Next slide"
                >
                    <RightIcon className="arrow-icon" />
                </button>
            </div>
        </>
    );
}
