import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import styles from './CardCarousel.module.scss';
import { CardCarousel } from './CardCarousel';

const mockNavButton = jest.fn();

jest.mock('./CarouselNavButton/CarouselNavButton', () => ({
    CarouselNavButton: (props: any) => {
        mockNavButton(props);
        return (
            <button
                type="button"
                data-testid={`nav-${props.side}`}
                aria-label={props.ariaLabel}
                onClick={props.onClick}
            />
        );
    },
}));

const LeftIcon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="left-icon" {...props} />;
const RightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="right-icon" {...props} />;

const setElProp = (el: Element, prop: string, value: any) => {
    Object.defineProperty(el, prop, { value, configurable: true, writable: true });
};

const setViewportMetrics = (
    viewport: HTMLElement,
    metrics: { scrollLeft: number; clientWidth: number; scrollWidth: number },
) => {
    setElProp(viewport, 'scrollLeft', metrics.scrollLeft);
    setElProp(viewport, 'clientWidth', metrics.clientWidth);
    setElProp(viewport, 'scrollWidth', metrics.scrollWidth);
};

const sync = (viewport: HTMLElement, metrics: { scrollLeft: number; clientWidth: number; scrollWidth: number }) => {
    setViewportMetrics(viewport, metrics);
    fireEvent.scroll(viewport);
};

const mockCssVars = (vars: Record<string, string>) => {
    window.getComputedStyle = (() =>
        ({
            getPropertyValue: (name: string) => vars[name] ?? '',
        }) as any) as any;
};

const setup = (props: Partial<React.ComponentProps<typeof CardCarousel>> = {}) => {
    mockNavButton.mockClear();

    const utils = render(
        <CardCarousel
            itemsCount={props.itemsCount ?? 3}
            LeftIcon={props.LeftIcon ?? LeftIcon}
            RightIcon={props.RightIcon ?? RightIcon}
            variant={props.variant}
        >
            {props.children ?? (
                <>
                    <div>c0</div>
                    <div>c1</div>
                    <div>c2</div>
                </>
            )}
        </CardCarousel>,
    );

    const viewport = utils.container.querySelector(`.${styles.viewport}`) as HTMLElement;

    return { ...utils, viewport };
};

const getNavProps = (side: 'left' | 'right') => {
    const call = mockNavButton.mock.calls.find((c) => c?.[0]?.side === side);
    return call?.[0];
};

describe('CardCarousel', () => {
    const originalGetComputedStyle = window.getComputedStyle;
    const originalRaf = window.requestAnimationFrame;

    beforeEach(() => {
        window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
            cb(0);
            return 0 as any;
        }) as any;
    });

    afterEach(() => {
        window.getComputedStyle = originalGetComputedStyle;
        window.requestAnimationFrame = originalRaf;
        mockNavButton.mockClear();
    });

    it('renders children', () => {
        setup({ children: <div>child</div> });
        expect(screen.getByText('child')).toBeInTheDocument();
    });

    it('does not render nav buttons by default', () => {
        setup();
        expect(screen.queryByTestId('nav-left')).not.toBeInTheDocument();
        expect(screen.queryByTestId('nav-right')).not.toBeInTheDocument();
    });

    it('renders only right nav button when overflowed at start', () => {
        const { viewport } = setup();
        sync(viewport, { scrollLeft: 0, clientWidth: 100, scrollWidth: 200 });

        expect(screen.queryByTestId('nav-left')).not.toBeInTheDocument();
        expect(screen.getByTestId('nav-right')).toBeInTheDocument();
    });

    it('renders both nav buttons when in the middle', () => {
        const { viewport } = setup();
        sync(viewport, { scrollLeft: 50, clientWidth: 100, scrollWidth: 200 });

        expect(screen.getByTestId('nav-left')).toBeInTheDocument();
        expect(screen.getByTestId('nav-right')).toBeInTheDocument();
    });

    it('renders only left nav button when at the end', () => {
        const { viewport } = setup();
        sync(viewport, { scrollLeft: 100, clientWidth: 100, scrollWidth: 200 });

        expect(screen.getByTestId('nav-left')).toBeInTheDocument();
        expect(screen.queryByTestId('nav-right')).not.toBeInTheDocument();
    });

    it('keeps nav state when scroll metrics do not change', () => {
        const { viewport } = setup();
        const metrics = { scrollLeft: 50, clientWidth: 100, scrollWidth: 200 };

        sync(viewport, metrics);
        sync(viewport, metrics);

        expect(screen.getByTestId('nav-left')).toBeInTheDocument();
        expect(screen.getByTestId('nav-right')).toBeInTheDocument();
    });

    it('scrolls forward on right click', () => {
        const { viewport } = setup();

        const scrollToMock = jest.fn();
        viewport.scrollTo = scrollToMock;

        const firstCard = viewport.querySelector('.track > *');
        if (firstCard) {
            firstCard.getBoundingClientRect = jest.fn(() => ({ width: 10 }) as DOMRect);
        }

        const track = viewport.querySelector('.track');
        if (track) {
            jest.spyOn(globalThis, 'getComputedStyle').mockImplementation((elem) => {
                if (elem === track) return { gap: '5px' } as CSSStyleDeclaration;
                return {} as CSSStyleDeclaration;
            });
        }

        sync(viewport, { scrollLeft: 0, clientWidth: 100, scrollWidth: 200 });
        fireEvent.click(screen.getByTestId('nav-right'));

        expect(scrollToMock).toHaveBeenCalledWith({ left: 15, behavior: 'smooth' });
    });

    it('scrolls backward on left click', () => {
        const { viewport } = setup();

        const scrollToMock = jest.fn();
        viewport.scrollTo = scrollToMock;

        const firstCard = viewport.querySelector('.track > *');
        if (firstCard) {
            firstCard.getBoundingClientRect = jest.fn(() => ({ width: 10 }) as DOMRect);
        }

        const track = viewport.querySelector('.track');
        if (track) {
            jest.spyOn(globalThis, 'getComputedStyle').mockImplementation((elem) => {
                if (elem === track) return { gap: '5px' } as CSSStyleDeclaration;
                return {} as CSSStyleDeclaration;
            });
        }

        sync(viewport, { scrollLeft: 50, clientWidth: 100, scrollWidth: 200 });
        fireEvent.click(screen.getByTestId('nav-left'));

        expect(scrollToMock).toHaveBeenCalledWith({ left: 30, behavior: 'smooth' });

        jest.restoreAllMocks();
    });

    it('uses 0 for gap when css gap is invalid or missing', () => {
        const { viewport } = setup();

        const scrollToMock = jest.fn();
        viewport.scrollTo = scrollToMock;

        const firstCard = viewport.querySelector('.track > *');
        if (firstCard) {
            firstCard.getBoundingClientRect = jest.fn(() => ({ width: 10 }) as DOMRect);
        }

        const track = viewport.querySelector('.track');
        if (track) {
            jest.spyOn(globalThis, 'getComputedStyle').mockImplementation((elem) => {
                if (elem === track) return { gap: 'nope' } as CSSStyleDeclaration;
                return {} as CSSStyleDeclaration;
            });
        }

        sync(viewport, { scrollLeft: 0, clientWidth: 100, scrollWidth: 200 });
        fireEvent.click(screen.getByTestId('nav-right'));

        expect(scrollToMock).toHaveBeenCalledWith({ left: 10, behavior: 'smooth' });

        jest.restoreAllMocks();
    });

    it('updates nav on window resize', () => {
        const { viewport } = setup({ variant: 'template' });

        setViewportMetrics(viewport, { scrollLeft: 0, clientWidth: 100, scrollWidth: 200 });
        fireEvent(window, new Event('resize'));

        expect(screen.getByTestId('nav-right')).toBeInTheDocument();
    });

    it('removes resize listener on unmount', () => {
        const removeSpy = jest.spyOn(window, 'removeEventListener');
        const { unmount } = setup();

        unmount();

        expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        removeSpy.mockRestore();
    });

    it('does not crash when handlers run after unmount (ref guards)', () => {
        const addSpy = jest.spyOn(window, 'addEventListener');

        const { viewport, unmount } = setup();

        sync(viewport, { scrollLeft: 0, clientWidth: 100, scrollWidth: 200 });

        const resizeHandler = addSpy.mock.calls.find((c) => c[0] === 'resize')?.[1] as any;
        const rightOnClick = getNavProps('right')?.onClick as (() => void) | undefined;

        unmount();

        expect(() => resizeHandler?.()).not.toThrow();
        expect(() => rightOnClick?.()).not.toThrow();

        addSpy.mockRestore();
    });
});
