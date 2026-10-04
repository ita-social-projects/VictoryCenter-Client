import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StoriesOfVictoryPage } from './StoriesOfVictoryPage';
import { storiesOfVictoryPageDataFetch } from '@/services/api/public/feedback/feedback-api';
import { StoriesOfVictoryPageData } from '@/types/public/stories-of-victory';

jest.mock('@/services/api/public/feedback/feedback-api', () => ({
    storiesOfVictoryPageDataFetch: jest.fn(),
}));

jest.mock('@/components/common/loadable-content/LoadableContent', () => ({
    LoadableContent: function MockLoadableContent({ isLoading, error, children }: any) {
        return (
            <div data-testid="loadable-content" data-loading={String(isLoading)} data-error={String(error)}>
                {children}
            </div>
        );
    },
}));

jest.mock('./components/slogan/SloganSection', () => ({
    SloganSection: () => <div data-testid="slogan-section" />,
}));

jest.mock('./components/review-articles/ReviewArticlesSection', () => ({
    ReviewArticlesSection: ({ content }: any) => (
        <div data-testid="review-articles-section" data-count={content?.length ?? 0} />
    ),
}));

jest.mock('./components/reviews/ReviewsSection', () => ({
    ReviewsSection: ({ content }: any) => <div data-testid="reviews-section" data-count={content?.length ?? 0} />,
}));

jest.mock('./components/video-reviews/VideoReviewsSection', () => ({
    VideoReviewsSection: ({ content }: any) => (
        <div data-testid="video-reviews-section" data-count={content?.length ?? 0} />
    ),
}));

const mockFetch = storiesOfVictoryPageDataFetch as jest.Mock;

const pageData: StoriesOfVictoryPageData = {
    histories: [
        { id: 1, title: 'T1', story: 'S1', image: 'a.jpg' },
        { id: 2, title: 'T2', story: 'S2', image: 'b.jpg' },
    ],
    reviews: [{ id: 3, name: 'N', review: 'R' }],
    videos: [
        { id: 4, title: 'V1', link: 'l1' },
        { id: 5, title: 'V2', link: 'l2' },
        { id: 6, title: 'V3', link: 'l3' },
    ],
};

describe('StoriesOfVictoryPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the loading state while data is being fetched', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));

        render(<StoriesOfVictoryPage />);

        expect(screen.getByTestId('loadable-content')).toHaveAttribute('data-loading', 'true');
        expect(screen.queryByTestId('slogan-section')).not.toBeInTheDocument();
    });

    it('renders all four sections with the fetched data', async () => {
        mockFetch.mockResolvedValue(pageData);

        render(<StoriesOfVictoryPage />);

        await waitFor(() => {
            expect(screen.getByTestId('slogan-section')).toBeInTheDocument();
        });
        expect(screen.getByTestId('loadable-content')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByTestId('loadable-content')).toHaveAttribute('data-error', 'false');
        expect(screen.getByTestId('review-articles-section')).toHaveAttribute('data-count', '2');
        expect(screen.getByTestId('reviews-section')).toHaveAttribute('data-count', '1');
        expect(screen.getByTestId('video-reviews-section')).toHaveAttribute('data-count', '3');
    });

    it('renders the video reviews section before the reviews section', async () => {
        mockFetch.mockResolvedValue(pageData);

        render(<StoriesOfVictoryPage />);

        const videos = await screen.findByTestId('video-reviews-section');
        const reviews = screen.getByTestId('reviews-section');
        expect(videos.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('passes an error to LoadableContent when fetching fails', async () => {
        mockFetch.mockRejectedValue(new Error('network'));

        render(<StoriesOfVictoryPage />);

        await waitFor(() => {
            expect(screen.getByTestId('loadable-content')).toHaveAttribute('data-loading', 'false');
        });
        expect(screen.getByTestId('loadable-content')).not.toHaveAttribute('data-error', 'false');
        expect(screen.queryByTestId('slogan-section')).not.toBeInTheDocument();
    });
});
