import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Swiper } from './Swiper';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';

jest.mock('@/assets/icons/arrow-right.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-right" />,
}));

let mockSwiperInstance: any;
let mockInitCallback: any;
let mockSlideChangeCallback: any;
let mockResizeCallback: any;
let mockReachBeginningCallback: any;
let mockReachEndCallback: any;
let mockFromEdgeCallback: any;

jest.mock('swiper/react', () => {
    const React = require('react');
    return {
        Swiper: ({ children, onInit, onSlideChange, onResize, onReachBeginning, onReachEnd, onFromEdge }: any) => {
            React.useEffect(() => {
                mockInitCallback = onInit;
                mockSlideChangeCallback = onSlideChange;
                mockResizeCallback = onResize;
                mockReachBeginningCallback = onReachBeginning;
                mockReachEndCallback = onReachEnd;
                mockFromEdgeCallback = onFromEdge;

                if (onInit) {
                    mockSwiperInstance = {
                        isBeginning: false,
                        isEnd: false,
                        isLocked: false,
                        slides: [1, 2, 3],
                        params: { slidesPerView: 1 },
                        activeIndex: 0,
                        slidePrev: jest.fn(),
                        slideNext: jest.fn(),
                        slideTo: jest.fn(),
                    };
                    onInit(mockSwiperInstance);
                }
            }, [onInit]);
            return <div data-testid="swiper">{children}</div>;
        },
        SwiperSlide: ({ children, className }: any) => (
            <div data-testid="swiper-slide" className={className}>
                {children}
            </div>
        ),
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

    beforeEach(() => {
        mockSwiperInstance = null;
        mockInitCallback = null;
        mockSlideChangeCallback = null;
        mockResizeCallback = null;
        mockReachBeginningCallback = null;
        mockReachEndCallback = null;
        mockFromEdgeCallback = null;
    });

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
                        icon: ArrowRight,
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
            const prevButton = screen.getByLabelText('Previous');
            const nextButton = screen.getByLabelText('Next');
            expect(prevButton).toBeInTheDocument();
            expect(nextButton).toBeInTheDocument();
        });
    });

    it('does not render navigation buttons when not provided', () => {
        render(<Swiper items={items} renderItem={renderItem} slidesPerView={1} />);
        expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Next')).not.toBeInTheDocument();
    });

    it('returns null when items is null or empty', () => {
        const { container } = render(<Swiper items={null} renderItem={renderItem} />);
        expect(container.firstChild).toBeNull();

        const { container: container2 } = render(<Swiper items={[]} renderItem={renderItem} />);
        expect(container2.firstChild).toBeNull();
    });

    it('calls slideTo(0) when only next button and swiper is at end', async () => {
        const user = userEvent.setup();
        render(
            <Swiper
                items={items}
                renderItem={renderItem}
                navigationButtons={{
                    next: {
                        icon: ArrowRight,
                        ariaLabel: 'Next',
                        variant: 'primary-dark' as const,
                    },
                }}
            />,
        );

        await waitFor(() => expect(mockSwiperInstance).toBeTruthy());

        mockSwiperInstance.isEnd = true;

        const nextButton = screen.getByLabelText('Next');
        await user.click(nextButton);

        expect(mockSwiperInstance.slideTo).toHaveBeenCalledWith(0);
    });

    it('updates button states on resize', async () => {
        render(
            <Swiper
                items={items}
                renderItem={renderItem}
                navigationButtons={{
                    prev: {
                        icon: ArrowRight,
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

        await waitFor(() => expect(mockResizeCallback).toBeTruthy());

        mockSwiperInstance.isBeginning = true;
        mockSwiperInstance.isEnd = false;
        mockResizeCallback(mockSwiperInstance);

        await waitFor(() => {
            const prevButton = screen.getByLabelText('Previous');
            expect(prevButton).toBeDisabled();
        });
    });
});
