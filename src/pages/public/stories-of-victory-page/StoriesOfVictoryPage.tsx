import React from 'react';
import { SloganSection } from './components/slogan/SloganSection';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { ReviewsSection } from './components/reviews/ReviewsSection';
import { ReviewArticlesSection } from './components/review-articles/ReviewArticlesSection';
import { VideoReviewsSection } from './components/video-reviews/VideoReviewsSection';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { storiesOfVictoryPageDataFetch } from '@/services/api/public/feedback/feedback-api';
import { StoriesOfVictoryPageData } from '@/types/public/stories-of-victory';

export const StoriesOfVictoryPage: React.FC = () => {
    const { data, isLoading, error } = useDataFetch<StoriesOfVictoryPageData | null>({
        initialData: null,
        fetchHandler: storiesOfVictoryPageDataFetch,
    });

    return (
        <LoadableContent isLoading={isLoading} error={error || !data}>
            {data && (
                <>
                    <SloganSection />
                    <ReviewArticlesSection content={data.histories} />
                    <VideoReviewsSection content={data.videos} />
                    <ReviewsSection content={data.reviews} />
                </>
            )}
        </LoadableContent>
    );
};
