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

const readPxVar = (cs: CSSStyleDeclaration, name: string) => {
    const raw = cs.getPropertyValue(name).trim();
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
};

export const CardCarousel = ({ children, itemsCount, LeftIcon, RightIcon, variant = 'default' }: CardCarouselProps) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const syncNav = useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;

        const left = Math.floor(el.scrollLeft) > 0;
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

            const cs = getComputedStyle(el);
            const step = readPxVar(cs, '--pair-card-width') + readPxVar(cs, '--gap');

            el.scrollBy({ left: dir * step, behavior: 'smooth' });
            requestAnimationFrame(syncNav);
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
