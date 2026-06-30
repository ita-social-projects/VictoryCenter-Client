import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ReviewArticlesSection } from './ReviewArticlesSection';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';

// Mock SVG icon FIRST
jest.mock('@/assets/icons/square-arrow-out-up-right.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-icon" />,
}));

// Mock react-i18next BEFORE importing components
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

const article1: StoriesOfVictoryReviewArticle = {
    id: 1,
    title: 'Article 1',
    image: 'image1.jpg',
};
const article2: StoriesOfVictoryReviewArticle = {
    id: 2,
    title: 'Article 2',
    image: 'image2.jpg',
};
const article3: StoriesOfVictoryReviewArticle = {
    id: 3,
    title: 'Article 3',
    image: 'image3.jpg',
};

describe('ReviewArticlesSection', () => {
    beforeEach(() => {
        const { useTranslation } = require('react-i18next');
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => (key === 'ARTICLES.READ_STORY' ? 'Read Story' : key),
            i18n: { changeLanguage: jest.fn() },
        });
    });

    it('should render section when content is null', () => {
        const { container } = render(<ReviewArticlesSection content={null} />);
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render section when content is empty array', () => {
        const { container } = render(<ReviewArticlesSection content={[]} />);
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render articles container when content has items', () => {
        render(<ReviewArticlesSection content={[article1]} />);
        expect(screen.getByText('"Article 1"')).toBeInTheDocument();
    });

    it('should render all articles from content array', () => {
        render(<ReviewArticlesSection content={[article1, article2, article3]} />);
        expect(screen.getByText('"Article 1"')).toBeInTheDocument();
        expect(screen.getByText('"Article 2"')).toBeInTheDocument();
        expect(screen.getByText('"Article 3"')).toBeInTheDocument();
    });

    it('should render article image when image is provided', () => {
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

    it('should render article title', () => {
        render(<ReviewArticlesSection content={[{ ...article1, title: 'Test Article Title' }]} />);
        const title = screen.getByText('"Test Article Title"');
        expect(title).toBeInTheDocument();
        expect(title.tagName).toBe('H3');
    });

    it('should render article link with read story text', () => {
        render(<ReviewArticlesSection content={[article1]} />);
        expect(screen.getByText('Read Story')).toBeInTheDocument();
    });

    it('should render arrow icon for each article', () => {
        render(<ReviewArticlesSection content={[article1, article2]} />);
        const icons = screen.getAllByTestId('arrow-icon');
        expect(icons).toHaveLength(2);
    });

    it('should call useTranslation with successPage namespace', () => {
        const { useTranslation } = require('react-i18next');
        render(<ReviewArticlesSection content={[article1]} />);
        expect(useTranslation).toHaveBeenCalledWith('successPage');
    });

    it('should use article id as key for each article', () => {
        const { container } = render(<ReviewArticlesSection content={[article1, article2]} />);
        const articles = container.querySelectorAll('.article');
        expect(articles).toHaveLength(2);
    });
});
