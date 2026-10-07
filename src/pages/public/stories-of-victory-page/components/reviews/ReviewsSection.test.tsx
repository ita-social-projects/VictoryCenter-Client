import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ReviewsSection } from './ReviewsSection';
import { StoriesOfVictoryReview } from '@/types/public/stories-of-victory';
import { TranslationStatus } from '@/types/common/language';

let mockCurrentLanguage = 'uk';
jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage }),
}));

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

    const singleReview: StoriesOfVictoryReview[] = [{ id: 1, name: 'John Doe', review: 'Great service!' }];

    it('should render section element', () => {
        const { container } = render(<ReviewsSection content={singleReview} />);
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render title with correct translation', () => {
        render(<ReviewsSection content={singleReview} />);
        expect(screen.getByText('REVIEWS.TITLE')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should call useTranslation with successPage namespace', () => {
        const { useTranslation } = require('react-i18next');
        render(<ReviewsSection content={singleReview} />);
        expect(useTranslation).toHaveBeenCalledWith('successPage');
    });

    it('should render Swiper component', () => {
        const { Swiper } = require('@/components/public/swiper/Swiper');
        render(<ReviewsSection content={singleReview} />);
        expect(Swiper).toHaveBeenCalled();
    });

    it.each([[null], [[]]])('should render nothing, including the title, when content is %p', (content) => {
        const { Swiper } = require('@/components/public/swiper/Swiper');
        const { container } = render(<ReviewsSection content={content} />);
        expect(container).toBeEmptyDOMElement();
        expect(Swiper).not.toHaveBeenCalled();
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

    describe('localization', () => {
        afterEach(() => {
            mockCurrentLanguage = 'uk';
        });

        it('shows the English translation on the English site', () => {
            mockCurrentLanguage = 'en';
            const content: StoriesOfVictoryReview[] = [
                {
                    id: 1,
                    name: 'Олена',
                    review: 'Дякуємо!',
                    localizations: [
                        {
                            language: { id: 2, code: 'en' },
                            translationStatus: TranslationStatus.Relevant,
                            authorName: 'Olena',
                            text: 'Thank you!',
                        },
                    ],
                },
            ];

            render(<ReviewsSection content={content} />);

            expect(screen.getByText('"Thank you!"')).toBeInTheDocument();
            expect(screen.getByText('Olena')).toBeInTheDocument();
        });

        it('falls back to the Ukrainian text on the English site when there is no translation', () => {
            mockCurrentLanguage = 'en';
            render(<ReviewsSection content={[{ id: 1, name: 'Олена', review: 'Дякуємо!' }]} />);

            expect(screen.getByText('"Дякуємо!"')).toBeInTheDocument();
            expect(screen.getByText('Олена')).toBeInTheDocument();
        });
    });
});
