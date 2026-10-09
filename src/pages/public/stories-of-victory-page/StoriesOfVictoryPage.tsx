import React from 'react';
import { SloganSection } from './components/slogan/SloganSection';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { ReviewsSection } from './components/reviews/ReviewsSection';
import { ReviewArticlesSection } from './components/review-articles/ReviewArticlesSection';
import { VideoReviewsSection } from './components/video-reviews/VideoReviewsSection';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PublicFeedbackApi } from '@/services/api/public/feedback/feedback-api';
import {
    StoriesOfVictoryReview,
    StoriesOfVictoryReviewArticle,
    StoriesOfVictoryReviewVideo,
} from '@/types/public/stories-of-victory';

export const StoriesOfVictoryPage: React.FC = () => {
    const histories = useDataFetch<StoriesOfVictoryReviewArticle[]>({
        initialData: [],
        fetchHandler: PublicFeedbackApi.fetchHistories,
    });
    const videos = useDataFetch<StoriesOfVictoryReviewVideo[]>({
        initialData: [],
        fetchHandler: PublicFeedbackApi.fetchVideos,
    });
    const reviews = useDataFetch<StoriesOfVictoryReview[]>({
        initialData: [],
        fetchHandler: PublicFeedbackApi.fetchReviews,
    });

    const isLoading = histories.isLoading || videos.isLoading || reviews.isLoading;
    const allFailed = Boolean(histories.error && videos.error && reviews.error);

    return (
        <LoadableContent isLoading={isLoading} error={allFailed}>
            <SloganSection />
            <LoadableContent isLoading={false} error={Boolean(histories.error)}>
                <ReviewArticlesSection content={histories.data} />
            </LoadableContent>
            <LoadableContent isLoading={false} error={Boolean(videos.error)}>
                <VideoReviewsSection content={videos.data} />
            </LoadableContent>
            <LoadableContent isLoading={false} error={Boolean(reviews.error)}>
                <ReviewsSection content={reviews.data} />
            </LoadableContent>
        </LoadableContent>
    );
};
