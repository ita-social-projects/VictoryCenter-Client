import { useRef, useState, useCallback, useMemo } from 'react';
import { Swiper as SwiperReact, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import { Button, ButtonProps } from '@/components/public/ui/button';

export type ShowScrollbar = { isVisible: true; className: string; classNameDrag: string } | { isVisible: false };

interface NavigationButtons {
    classNamebuttonBlock?: string;
    prev?: ButtonProps;
    next?: ButtonProps;
}

interface SwiperProps<T> {
    items: T[] | null;
    renderItem: (item: T, index: number) => React.ReactNode;
    slidesPerView?: number | 'auto';
    breakpoints?: Record<number, { slidesPerView: number | 'auto' }>;
    showScrollbar?: ShowScrollbar;
    onSlideChange?: (activeIndex: number) => void;
    classNameSwiperSlide?: string;
    navigationButtons?: NavigationButtons;
}

export function Swiper<T>({
    items,
    renderItem,
    slidesPerView = 'auto',
    breakpoints = {},
    showScrollbar = { isVisible: false },
    onSlideChange,
    classNameSwiperSlide,
    navigationButtons,
}: SwiperProps<T>) {
    const swiperRef = useRef<SwiperClass | null>(null);
    const [isPrevEnabled, setIsPrevEnabled] = useState(false);
    const [isNextEnabled, setIsNextEnabled] = useState(true);
    const { isVisible } = showScrollbar;
    const isOnlyNextButton = Boolean(navigationButtons?.next && !navigationButtons?.prev);

    const handlePrev = useCallback(() => {
        swiperRef.current?.slidePrev();
    }, []);

    const handleNext = useCallback(() => {
        if (!swiperRef.current) return;

        if (isOnlyNextButton && swiperRef.current.isEnd) {
            swiperRef.current.slideTo(0);
        } else {
            swiperRef.current.slideNext();
        }
    }, [isOnlyNextButton]);

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
        if (isVisible) {
            modules.push(Scrollbar);
        }
        return modules;
    }, [isVisible]);

    if (!items || items.length === 0) {
        return null;
    }

    const scrollbarConfig = isVisible
        ? {
              draggable: true,
              el: `.${showScrollbar.className}`,
              dragClass: `${showScrollbar.classNameDrag}`,
          }
        : false;

    const prevButtonProps = navigationButtons?.prev;
    const nextButtonProps = navigationButtons?.next;

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
                scrollbar={scrollbarConfig}
                breakpoints={breakpoints}
            >
                {items.map((item, index) => (
                    <SwiperSlide className={classNameSwiperSlide} key={index}>
                        {renderItem(item, index)}
                    </SwiperSlide>
                ))}
            </SwiperReact>
            <div className={navigationButtons?.classNamebuttonBlock}>
                {prevButtonProps && <Button {...prevButtonProps} onClick={handlePrev} disabled={!isPrevEnabled} />}
                {nextButtonProps && (
                    <Button
                        {...nextButtonProps}
                        onClick={handleNext}
                        disabled={isOnlyNextButton ? false : !isNextEnabled}
                    />
                )}
            </div>
        </>
    );
}
