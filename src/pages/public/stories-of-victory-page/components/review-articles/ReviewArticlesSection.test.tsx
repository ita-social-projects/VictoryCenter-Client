import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ReviewArticlesSection } from './ReviewArticlesSection';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';

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
        expect(title.tagName).toBe('DIV');
    });

    it('should use article id as key for each article', () => {
        const { container } = render(<ReviewArticlesSection content={[article1, article2]} />);
        const articles = container.querySelectorAll('.article');
        expect(articles).toHaveLength(2);
    });

    it('should show truncated text by default when title exceeds 100 characters', () => {
        const longTitle = 'A'.repeat(150);
        render(<ReviewArticlesSection content={[{ id: 1, title: longTitle, image: 'img.jpg' }]} />);
        expect(screen.getByText(`"${'A'.repeat(100)}..."`)).toBeInTheDocument();
    });

    it('should show full text on mouse enter', () => {
        const longTitle = 'A'.repeat(150);
        const { container } = render(
            <ReviewArticlesSection content={[{ id: 1, title: longTitle, image: 'img.jpg' }]} />,
        );
        fireEvent.mouseEnter(container.querySelector('.article')!);
        expect(screen.getByText(`"${longTitle}"`)).toBeInTheDocument();
    });

    it('should revert to truncated text on mouse leave', () => {
        const longTitle = 'A'.repeat(150);
        const { container } = render(
            <ReviewArticlesSection content={[{ id: 1, title: longTitle, image: 'img.jpg' }]} />,
        );
        const article = container.querySelector('.article')!;
        fireEvent.mouseEnter(article);
        fireEvent.mouseLeave(article);
        expect(screen.getByText(`"${'A'.repeat(100)}..."`)).toBeInTheDocument();
    });
});
