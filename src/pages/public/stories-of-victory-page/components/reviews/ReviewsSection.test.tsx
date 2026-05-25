import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ReviewsSection } from './ReviewsSection';
import { StoriesOfVictoryReview } from '@/types/public/stories-of-victory';

// Mock react-i18next FIRST, before importing components
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

// Mock Swiper component
jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: jest.fn(),
}));

describe('ReviewsSection', () => {
    beforeEach(() => {
        const { useTranslation } = require('react-i18next');
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string, fallback?: string) => fallback || key,
            i18n: { changeLanguage: jest.fn() },
        });

        const { Swiper } = require('@/components/public/swiper/Swiper');
        (Swiper as jest.Mock).mockImplementation(
            ({ items, renderItem, classNameSwiperSlide, navigationButtons }: any) => (
                <div data-testid="swiper-component" data-items-length={items?.length || 0}>
                    <div data-testid="swiper-nav-config" data-nav-config={JSON.stringify(navigationButtons)} />
                    <div data-testid="swiper-slide-class" data-class={classNameSwiperSlide} />
                    {items &&
                        items.map((item: any) => (
                            <div key={item.id} data-testid={`review-item-${item.id}`}>
                                {/* eslint-disable-next-line testing-library/no-render-in-setup */}
                                {renderItem(item)}
                            </div>
                        ))}
                </div>
            ),
        );
    });

    it('should render section element', () => {
        const { container } = render(<ReviewsSection content={null} />);
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render title with correct translation', () => {
        render(<ReviewsSection content={null} />);
        expect(screen.getByText('REVIEWS.TITLE')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should call useTranslation with successPage namespace', () => {
        const { useTranslation } = require('react-i18next');
        render(<ReviewsSection content={null} />);
        expect(useTranslation).toHaveBeenCalledWith('successPage');
    });

    it('should render Swiper component', () => {
        const { Swiper } = require('@/components/public/swiper/Swiper');
        render(<ReviewsSection content={null} />);
        expect(Swiper).toHaveBeenCalled();
    });

    it('should pass null items to Swiper when content is null', () => {
        const { Swiper } = require('@/components/public/swiper/Swiper');
        render(<ReviewsSection content={null} />);
        const calls = (Swiper as jest.Mock).mock.calls;
        expect(calls[0][0].items).toBeNull();
    });

    it('should pass content items to Swiper component', () => {
        const content: StoriesOfVictoryReview[] = [
            { id: 1, name: 'John Doe', review: 'Great service!' },
            { id: 2, name: 'Jane Smith', review: 'Excellent experience!' },
        ];
        render(<ReviewsSection content={content} />);
        const swiperComponent = screen.getByTestId('swiper-component');
        expect(swiperComponent).toHaveAttribute('data-items-length', '2');
    });

    it('should pass navigation buttons config to Swiper', () => {
        const content: StoriesOfVictoryReview[] = [{ id: 1, name: 'John Doe', review: 'Great service!' }];
        render(<ReviewsSection content={content} />);
        const navConfig = screen.getByTestId('swiper-nav-config');
        const config = JSON.parse(navConfig.getAttribute('data-nav-config') || '{}');
        expect(config.prev).toBeDefined();
        expect(config.next).toBeDefined();
        expect(config.prev.className).toBeDefined();
        expect(config.next.className).toBeDefined();
    });

    it('should render review cards with correct structure', () => {
        const content: StoriesOfVictoryReview[] = [{ id: 1, name: 'John Doe', review: 'Great service!' }];
        render(<ReviewsSection content={content} />);
        expect(screen.getByText('"Great service!"')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render multiple review items', () => {
        const content: StoriesOfVictoryReview[] = [
            { id: 1, name: 'John Doe', review: 'Great service!' },
            { id: 2, name: 'Jane Smith', review: 'Excellent experience!' },
            { id: 3, name: 'Bob Johnson', review: 'Highly recommended!' },
        ];
        render(<ReviewsSection content={content} />);
        expect(screen.getByTestId('review-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('review-item-2')).toBeInTheDocument();
        expect(screen.getByTestId('review-item-3')).toBeInTheDocument();
        expect(screen.getByText('"Great service!"')).toBeInTheDocument();
        expect(screen.getByText('"Excellent experience!"')).toBeInTheDocument();
        expect(screen.getByText('"Highly recommended!"')).toBeInTheDocument();
    });

    it('should pass classNameSwiperSlide prop to Swiper', () => {
        const content: StoriesOfVictoryReview[] = [{ id: 1, name: 'John Doe', review: 'Great service!' }];
        render(<ReviewsSection content={content} />);
        const slideClass = screen.getByTestId('swiper-slide-class');
        expect(slideClass).toHaveAttribute('data-class');
    });

    it('should render with empty content array', () => {
        render(<ReviewsSection content={[]} />);
        expect(screen.getByTestId('swiper-component')).toHaveAttribute('data-items-length', '0');
    });
});
