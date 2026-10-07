import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ReviewArticlesSection } from './ReviewArticlesSection';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import { TranslationStatus } from '@/types/common/language';

let mockCurrentLanguage = 'uk';
jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage }),
}));

const article1: StoriesOfVictoryReviewArticle = {
    id: 1,
    title: 'Article 1',
    story: 'Story 1',
    image: 'image1.jpg',
};
const article2: StoriesOfVictoryReviewArticle = {
    id: 2,
    title: 'Article 2',
    story: 'Story 2',
    image: 'image2.jpg',
};
const article3: StoriesOfVictoryReviewArticle = {
    id: 3,
    title: 'Article 3',
    story: 'Story 3',
    image: 'image3.jpg',
};

describe('ReviewArticlesSection', () => {
    beforeEach(() => {
        mockCurrentLanguage = 'uk';
    });

    it.each([[null], [[]]])('should render nothing when content is %p', (content) => {
        const { container } = render(<ReviewArticlesSection content={content} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render the story as a quote when content has items', () => {
        render(<ReviewArticlesSection content={[article1]} />);
        expect(screen.getByText('"Story 1"')).toBeInTheDocument();
    });

    it('should render all articles from content array', () => {
        render(<ReviewArticlesSection content={[article1, article2, article3]} />);
        expect(screen.getByText('"Story 1"')).toBeInTheDocument();
        expect(screen.getByText('"Story 2"')).toBeInTheDocument();
        expect(screen.getByText('"Story 3"')).toBeInTheDocument();
    });

    it('should render article image with the title as alt text', () => {
        render(<ReviewArticlesSection content={[article1]} />);
        const img = screen.getByAltText('Article 1');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'image1.jpg');
    });

    it('should not render article image when image is not provided', () => {
        render(<ReviewArticlesSection content={[{ ...article1, image: null }]} />);
        const images = screen.queryAllByAltText(/Article/);
        expect(images).toHaveLength(0);
    });

    it('should render the story inside a div', () => {
        render(<ReviewArticlesSection content={[{ ...article1, story: 'Test Story' }]} />);
        const story = screen.getByText('"Test Story"');
        expect(story).toBeInTheDocument();
        expect(story.tagName).toBe('DIV');
    });

    it('should use article id as key for each article', () => {
        const { container } = render(<ReviewArticlesSection content={[article1, article2]} />);
        const articles = container.querySelectorAll('.article');
        expect(articles).toHaveLength(2);
    });

    it('should show truncated text by default when story exceeds 100 characters', () => {
        const longStory = 'A'.repeat(150);
        render(<ReviewArticlesSection content={[{ ...article1, story: longStory }]} />);
        expect(screen.getByText(`"${'A'.repeat(100)}..."`)).toBeInTheDocument();
    });

    it('should show full text on mouse enter', () => {
        const longStory = 'A'.repeat(150);
        const { container } = render(<ReviewArticlesSection content={[{ ...article1, story: longStory }]} />);
        fireEvent.mouseEnter(container.querySelector('.article')!);
        expect(screen.getByText(`"${longStory}"`)).toBeInTheDocument();
    });

    it('keeps the collapsed text in the layout, hidden from screen readers, while expanded', () => {
        const longStory = 'A'.repeat(150);
        const { container } = render(<ReviewArticlesSection content={[{ ...article1, story: longStory }]} />);
        fireEvent.mouseEnter(container.querySelector('.article')!);

        const collapsed = screen.getByText(`"${'A'.repeat(100)}..."`);
        expect(collapsed).toHaveClass('collapsedHidden');
        expect(collapsed).toHaveAttribute('aria-hidden', 'true');
        expect(container.querySelector('.expandedText')).toHaveTextContent(`"${longStory}"`);
    });

    it('should revert to truncated text on mouse leave', () => {
        const longStory = 'A'.repeat(150);
        const { container } = render(<ReviewArticlesSection content={[{ ...article1, story: longStory }]} />);
        const article = container.querySelector('.article')!;
        fireEvent.mouseEnter(article);
        fireEvent.mouseLeave(article);
        expect(screen.getByText(`"${'A'.repeat(100)}..."`)).toBeInTheDocument();
    });

    describe('localization', () => {
        const translatedArticle: StoriesOfVictoryReviewArticle = {
            ...article1,
            localizations: [
                {
                    language: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    title: 'English title',
                    story: 'English story',
                },
            ],
        };

        it('shows the English translation on the English site', () => {
            mockCurrentLanguage = 'en';
            render(<ReviewArticlesSection content={[translatedArticle]} />);

            expect(screen.getByText('"English story"')).toBeInTheDocument();
            expect(screen.getByAltText('English title')).toBeInTheDocument();
        });

        it('shows the Ukrainian text on the Ukrainian site even when a translation exists', () => {
            render(<ReviewArticlesSection content={[translatedArticle]} />);

            expect(screen.getByText('"Story 1"')).toBeInTheDocument();
        });

        it('falls back to the Ukrainian text on the English site when there is no translation', () => {
            mockCurrentLanguage = 'en';
            render(<ReviewArticlesSection content={[article1]} />);

            expect(screen.getByText('"Story 1"')).toBeInTheDocument();
            expect(screen.getByAltText('Article 1')).toBeInTheDocument();
        });
    });
});
