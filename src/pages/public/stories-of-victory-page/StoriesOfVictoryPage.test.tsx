import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StoriesOfVictoryPage } from './StoriesOfVictoryPage';
import { PublicFeedbackApi } from '@/services/api/public/feedback/feedback-api';

jest.mock('@/services/api/public/feedback/feedback-api', () => ({
    PublicFeedbackApi: {
        fetchHistories: jest.fn(),
        fetchReviews: jest.fn(),
        fetchVideos: jest.fn(),
    },
}));

jest.mock('@/components/common/loadable-content/LoadableContent', () => ({
    LoadableContent: ({ isLoading, error, children }: any) => {
        if (isLoading) return <div data-testid="loader" />;
        if (error) return <div data-testid="error-message" />;
        return <>{children}</>;
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

const mockApi = PublicFeedbackApi as jest.Mocked<typeof PublicFeedbackApi>;

const histories = [
    { id: 1, title: 'T1', story: 'S1', image: 'a.jpg' },
    { id: 2, title: 'T2', story: 'S2', image: 'b.jpg' },
];
const reviews = [{ id: 3, name: 'N', review: 'R' }];
const videos = [
    { id: 4, title: 'V1', link: 'l1' },
    { id: 5, title: 'V2', link: 'l2' },
    { id: 6, title: 'V3', link: 'l3' },
];

describe('StoriesOfVictoryPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockApi.fetchHistories.mockResolvedValue(histories);
        mockApi.fetchReviews.mockResolvedValue(reviews);
        mockApi.fetchVideos.mockResolvedValue(videos);
    });

    it('shows a single loader while any section is still loading', () => {
        mockApi.fetchVideos.mockReturnValue(new Promise(() => {}));

        render(<StoriesOfVictoryPage />);

        expect(screen.getAllByTestId('loader')).toHaveLength(1);
        expect(screen.queryByTestId('slogan-section')).not.toBeInTheDocument();
    });

    it('renders all four sections with their fetched data', async () => {
        render(<StoriesOfVictoryPage />);

        expect(await screen.findByTestId('slogan-section')).toBeInTheDocument();
        expect(screen.getByTestId('review-articles-section')).toHaveAttribute('data-count', '2');
        expect(screen.getByTestId('reviews-section')).toHaveAttribute('data-count', '1');
        expect(screen.getByTestId('video-reviews-section')).toHaveAttribute('data-count', '3');
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('renders the video reviews section before the reviews section', async () => {
        render(<StoriesOfVictoryPage />);

        const videosSection = await screen.findByTestId('video-reviews-section');
        const reviewsSection = screen.getByTestId('reviews-section');
        expect(videosSection.compareDocumentPosition(reviewsSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows an error in place of only the section whose request failed', async () => {
        mockApi.fetchVideos.mockRejectedValue(new Error('videos down'));

        render(<StoriesOfVictoryPage />);

        expect(await screen.findByTestId('slogan-section')).toBeInTheDocument();
        expect(screen.getAllByTestId('error-message')).toHaveLength(1);
        expect(screen.queryByTestId('video-reviews-section')).not.toBeInTheDocument();
        expect(screen.getByTestId('review-articles-section')).toBeInTheDocument();
        expect(screen.getByTestId('reviews-section')).toBeInTheDocument();
    });

    it('shows a single page-level error when every request fails', async () => {
        mockApi.fetchHistories.mockRejectedValue(new Error('network'));
        mockApi.fetchReviews.mockRejectedValue(new Error('network'));
        mockApi.fetchVideos.mockRejectedValue(new Error('network'));

        render(<StoriesOfVictoryPage />);

        expect(await screen.findByTestId('error-message')).toBeInTheDocument();
        expect(screen.getAllByTestId('error-message')).toHaveLength(1);
        expect(screen.queryByTestId('slogan-section')).not.toBeInTheDocument();
    });

    it('passes the cancellation signal from useDataFetch to every request', async () => {
        render(<StoriesOfVictoryPage />);
        await screen.findByTestId('slogan-section');

        [mockApi.fetchHistories, mockApi.fetchReviews, mockApi.fetchVideos].forEach((fetchMock) => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.objectContaining({ cancellationSignal: expect.any(AbortSignal) }),
            );
        });
    });
});
