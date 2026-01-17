import { render, screen, waitFor } from '@testing-library/react';
import { Swiper } from './Swiper';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';

jest.mock('@/assets/icons/arrow-right.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-right" />,
}));

jest.mock('@/assets/icons/arrow-left.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-left" />,
}));

jest.mock('swiper/react', () => {
    const React = require('react');
    return {
        Swiper: ({ children, onInit }: any) => {
            React.useEffect(() => {
                if (onInit) {
                    const swiperMock = {
                        isBeginning: false,
                        isEnd: false,
                        isLocked: false,
                        slides: [1, 2, 3],
                        params: { slidesPerView: 1 },
                        on: jest.fn(),
                        slidePrev: jest.fn(),
                        slideNext: jest.fn(),
                        slideTo: jest.fn(),
                    };
                    onInit(swiperMock);
                }
            }, [onInit]);
            return <div data-testid="swiper">{children}</div>;
        },
        SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
    };
});

jest.mock('swiper/modules', () => ({
    Navigation: {},
    Pagination: {},
    Scrollbar: {},
}));

describe('Swiper', () => {
    const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
    ];
    const renderItem = (item: any) => <div data-testid="slide-item">{item.name}</div>;

    it('renders slides correctly', () => {
        render(<Swiper items={items} renderItem={renderItem} slidesPerView={1} />);
        const slides = screen.getAllByTestId('slide-item');
        expect(slides).toHaveLength(items.length);
    });

    it('renders swiper container', () => {
        render(<Swiper items={items} renderItem={renderItem} />);
        expect(screen.getByTestId('swiper')).toBeInTheDocument();
    });

    it('renders slide wrappers', () => {
        render(<Swiper items={items} renderItem={renderItem} />);
        expect(screen.getAllByTestId('swiper-slide')).toHaveLength(items.length);
    });

    it('renders navigation buttons when provided', async () => {
        render(
            <Swiper
                items={items}
                renderItem={renderItem}
                slidesPerView={1}
                navigationButtons={{
                    prev: {
                        icon: ArrowLeft,
                        ariaLabel: 'Previous',
                        variant: 'primary-dark' as const,
                    },
                    next: {
                        icon: ArrowRight,
                        ariaLabel: 'Next',
                        variant: 'primary-dark' as const,
                    },
                }}
            />,
        );

        await waitFor(() => {
            const leftArrow = screen.getByTestId('arrow-left');
            const rightArrow = screen.getByTestId('arrow-right');
            expect(leftArrow).toBeInTheDocument();
            expect(rightArrow).toBeInTheDocument();
        });
    });

    it('does not render navigation buttons when not provided', () => {
        render(<Swiper items={items} renderItem={renderItem} slidesPerView={1} />);
        expect(screen.queryByTestId('arrow-left')).not.toBeInTheDocument();
        expect(screen.queryByTestId('arrow-right')).not.toBeInTheDocument();
    });

    it('returns null when items is null or empty', () => {
        const { container } = render(<Swiper items={null} renderItem={renderItem} />);
        expect(container.firstChild).toBeNull();

        const { container: container2 } = render(<Swiper items={[]} renderItem={renderItem} />);
        expect(container2.firstChild).toBeNull();
    });
});
