import { render, screen } from '@testing-library/react';
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
        Swiper: ({ children }: any) => <div data-testid="swiper">{children}</div>,
        SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
    };
});

describe('CustomSwiper component', () => {
    const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
    ];

    const renderItem = (item: any) => <div data-testid="slide-item">{item.name}</div>;

    test('renders all slides', () => {
        render(<CustomSwiper items={items} renderItem={renderItem} slidesPerView={1} />);
        const slides = screen.getAllByTestId('slide-item');
        expect(slides).toHaveLength(items.length);
        slides.forEach((slide, i) => {
            expect(slide).toHaveTextContent(items[i].name);
        });
    });

    test('renders Swiper container', () => {
        render(<CustomSwiper items={items} renderItem={renderItem} slidesPerView={1} />);
        const swiper = screen.getByTestId('swiper');
        expect(swiper).toBeInTheDocument();
    });

    test('renders slide wrappers', () => {
        render(<CustomSwiper items={items} renderItem={renderItem} slidesPerView={1} />);
        const slideWrappers = screen.getAllByTestId('swiper-slide');
        expect(slideWrappers).toHaveLength(items.length);
    });
});
