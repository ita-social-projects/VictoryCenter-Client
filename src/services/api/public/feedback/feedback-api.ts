import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    FeedbackHistoryPublicDto,
    FeedbackReviewPublicDto,
    FeedbackVideoPublicDto,
    StoriesOfVictoryReview,
    StoriesOfVictoryReviewArticle,
    StoriesOfVictoryReviewVideo,
} from '@/types/public/stories-of-victory';
import {
    FeedbackHistoryLocalization,
    FeedbackReviewLocalization,
    FeedbackVideoLocalization,
} from '@/types/admin/feedback';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { RequestOptions } from '@/types/common/api';

const mapHistory = (dto: FeedbackHistoryPublicDto): StoriesOfVictoryReviewArticle => ({
    id: dto.id,
    title: dto.title,
    story: dto.story,
    image: getImageSrc(dto.image) || null,
    localizations: dto.localizations?.map((loc) =>
        mapLocalizationDtoToModel<typeof loc, FeedbackHistoryLocalization>(loc),
    ),
});

const mapReview = (dto: FeedbackReviewPublicDto): StoriesOfVictoryReview => ({
    id: dto.id,
    name: dto.authorName,
    review: dto.text,
    localizations: dto.localizations?.map((loc) =>
        mapLocalizationDtoToModel<typeof loc, FeedbackReviewLocalization>(loc),
    ),
});

const mapVideo = (dto: FeedbackVideoPublicDto): StoriesOfVictoryReviewVideo => ({
    id: dto.id,
    title: dto.title,
    link: dto.link,
    localizations: dto.localizations?.map((loc) =>
        mapLocalizationDtoToModel<typeof loc, FeedbackVideoLocalization>(loc),
    ),
});

export const PublicFeedbackApi = {
    fetchHistories: async (options: RequestOptions = {}): Promise<StoriesOfVictoryReviewArticle[]> => {
        const response = await axiosInstance.get<FeedbackHistoryPublicDto[]>(API_ROUTES.FEEDBACK_HISTORIES.PUBLISHED, {
            signal: options.cancellationSignal,
        });
        return response.data.map(mapHistory);
    },
    fetchReviews: async (options: RequestOptions = {}): Promise<StoriesOfVictoryReview[]> => {
        const response = await axiosInstance.get<FeedbackReviewPublicDto[]>(API_ROUTES.FEEDBACK_REVIEWS.PUBLISHED, {
            signal: options.cancellationSignal,
        });
        return response.data.map(mapReview);
    },
    fetchVideos: async (options: RequestOptions = {}): Promise<StoriesOfVictoryReviewVideo[]> => {
        const response = await axiosInstance.get<FeedbackVideoPublicDto[]>(API_ROUTES.VIDEO_REVIEWS.PUBLISHED, {
            signal: options.cancellationSignal,
        });
        return response.data.map(mapVideo);
    },
};
