import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ReviewArticlesSection } from './ReviewArticlesSection';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: (_localizations: unknown, fallback: unknown) => fallback,
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
    it.each([[null], [[]]])('should render nothing when content is %p', (content) => {
        const { container } = render(<ReviewArticlesSection content={content} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render all articles from content array', () => {
        render(<ReviewArticlesSection content={[article1, article2, article3]} />);
        expect(screen.getAllByRole('img')).toHaveLength(3);
    });

    it('should use article id as key for each article', () => {
        const { container } = render(<ReviewArticlesSection content={[article1, article2]} />);
        const articles = container.querySelectorAll('.articleCard');
        expect(articles).toHaveLength(2);
    });
});
