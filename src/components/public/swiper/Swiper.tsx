import { useRef, useState, useCallback, useMemo } from 'react';
import { Swiper as SwiperReact, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import { Button, ButtonProps } from '@/components/public/ui/button';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';

export type ShowScrollbar = { isVisible: true; className: string; classNameDrag: string } | { isVisible: false };

const SWIPER_NAVIGATION_CONFIG = {
    prev: {
        icon: ArrowLeft,
        ariaLabel: 'previous',
        variant: 'primary-dark' as const,
    },
    next: {
        icon: ArrowRight,
        ariaLabel: 'next',
        variant: 'primary-dark' as const,
    },
};

interface NavigationButtons {
    classNamebuttonBlock?: string;
    prev?: Partial<ButtonProps>;
    next?: Partial<ButtonProps>;
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

    const prevButtonProps = useMemo(
        () =>
            navigationButtons?.prev
                ? ({
                      ...SWIPER_NAVIGATION_CONFIG.prev,
                      ...navigationButtons.prev,
                  } as ButtonProps)
                : undefined,
        [navigationButtons?.prev],
    );

    const nextButtonProps = useMemo(
        () =>
            navigationButtons?.next
                ? ({
                      ...SWIPER_NAVIGATION_CONFIG.next,
                      ...navigationButtons.next,
                  } as ButtonProps)
                : undefined,
        [navigationButtons?.next],
    );

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
