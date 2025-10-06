import { render, screen, fireEvent } from '@testing-library/react';
import { CustomSwiper } from './CustomSwiper';

jest.mock('../../../assets/icons/arrow-right.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-right" />,
}));
jest.mock('../../../assets/icons/arrow-left.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-left" />,
}));

jest.mock('swiper/react', () => {
    const React = require('react');
    return {
        Swiper: ({ children, onSwiper }: any) => {
            const swiperMock = {
                isBeginning: false,
                isEnd: false,
                slides: [1, 2, 3],
                params: { slidesPerView: 1 },
                on: jest.fn(),
                slidePrev: jest.fn(),
                slideNext: jest.fn(),
            };
            onSwiper(swiperMock);
            return <div data-testid="swiper">{children}</div>;
        },
        SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
    };
});

describe('CustomSwiper', () => {
    const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
    ];
    const renderItem = (item: any) => <div data-testid="slide-item">{item.name}</div>;

    test('renders slides correctly', () => {
        render(<CustomSwiper items={items} renderItem={renderItem} slidesPerView={1} />);
        const slides = screen.getAllByTestId('slide-item');
        expect(slides).toHaveLength(items.length);
    });

    test('renders swiper container', () => {
        render(<CustomSwiper items={items} renderItem={renderItem} />);
        expect(screen.getByTestId('swiper')).toBeInTheDocument();
    });

    test('renders slide wrappers', () => {
        render(<CustomSwiper items={items} renderItem={renderItem} />);
        expect(screen.getAllByTestId('swiper-slide')).toHaveLength(items.length);
    });

    test('renders navigation buttons and triggers actions', () => {
        render(<CustomSwiper items={items} renderItem={renderItem} slidesPerView={1} />);
        const leftArrow = screen.getByTestId('arrow-left');
        const rightArrow = screen.getByTestId('arrow-right');
        expect(leftArrow).toBeInTheDocument();
        expect(rightArrow).toBeInTheDocument();
        const leftButton = leftArrow.closest('button');
        const rightButton = rightArrow.closest('button');
        expect(leftButton).toBeTruthy();
        expect(rightButton).toBeTruthy();
        fireEvent.click(leftButton!);
        fireEvent.click(rightButton!);
    });
});
