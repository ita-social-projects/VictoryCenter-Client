import cn from 'classnames';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { CarouselNavButton } from './CarouselNavButton/CarouselNavButton';
import styles from './CardCarousel.module.scss';

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface CardCarouselProps {
    children: ReactNode;
    itemsCount: number;
    LeftIcon: IconComponent;
    RightIcon: IconComponent;
    variant?: 'default' | 'template' | 'editable';
}

export const CardCarousel = ({ children, itemsCount, LeftIcon, RightIcon, variant = 'default' }: CardCarouselProps) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const targetScroll = useRef<number | null>(null);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const syncNav = useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;

        const left = Math.floor(el.scrollLeft) > 56;
        const right = Math.ceil(el.scrollLeft + el.clientWidth) < Math.ceil(el.scrollWidth);

        setCanLeft((p) => (p === left ? p : left));
        setCanRight((p) => (p === right ? p : right));
    }, []);

    useEffect(() => {
        syncNav();
    }, [syncNav, itemsCount]);

    useEffect(() => {
        const onResize = () => syncNav();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [syncNav]);

    const scrollByCard = useCallback(
        (dir: -1 | 1) => {
            const el = viewportRef.current;
            if (!el) return;

            const track = el.firstElementChild as HTMLElement;
            if (!track) return;

            const firstCard = track.firstElementChild as HTMLElement;
            if (!firstCard) return;

            const cardWidth = firstCard.getBoundingClientRect().width;

            const trackStyle = getComputedStyle(track);
            const gap = parseFloat(trackStyle.gap) || 0;

            const step = cardWidth + gap;

            const maxScroll = el.scrollWidth - el.clientWidth;
            const currentScroll = targetScroll.current !== null ? targetScroll.current : el.scrollLeft;

            const currentIndex = Math.round(currentScroll / step);
            let nextScroll = (currentIndex + dir) * step;

            if (nextScroll < 0) nextScroll = 0;
            if (nextScroll > maxScroll) nextScroll = maxScroll;

            targetScroll.current = nextScroll;
            el.scrollTo({ left: nextScroll, behavior: 'smooth' });
            requestAnimationFrame(syncNav);

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                targetScroll.current = null;
            }, 500);
        },
        [syncNav],
    );

    return (
        <div
            className={cn(styles.wrapper, {
                [styles.template]: variant === 'template',
                [styles.editable]: variant === 'editable',
            })}
        >
            {canLeft && (
                <CarouselNavButton
                    side="left"
                    variant={variant}
                    ariaLabel="previous"
                    Icon={LeftIcon}
                    onClick={() => scrollByCard(-1)}
                />
            )}

            <div ref={viewportRef} className={styles.viewport} onScroll={syncNav}>
                <div className={styles.track}>{children}</div>
            </div>

            {canRight && (
                <CarouselNavButton
                    side="right"
                    variant={variant}
                    ariaLabel="next"
                    Icon={RightIcon}
                    onClick={() => scrollByCard(1)}
                />
            )}
        </div>
    );
};
