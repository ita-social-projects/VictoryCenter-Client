import { SectionType } from '../common/stories-of-victory';
import { Image } from '../common/image';
import {
    FeedbackHistoryLocalization,
    FeedbackHistoryLocalizationDto,
    FeedbackReviewLocalization,
    FeedbackReviewLocalizationDto,
    FeedbackVideoLocalization,
    FeedbackVideoLocalizationDto,
} from '../admin/feedback';

export type StoriesOfVictorySection = {
    sectionType: SectionType;
    contents: StoriesOfVictoryReview[];
};

export type StoriesOfVictoryReview = {
    id: number;
    review: string | null;
    name: string | null;
    localizations?: FeedbackReviewLocalization[];
};

export type StoriesOfVictoryReviewVideo = {
    id: number;
    title: string | null;
    link: string | null;
    localizations?: FeedbackVideoLocalization[];
};

export type StoriesOfVictoryReviewArticle = {
    id: number;
    title: string;
    story: string;
    image: string | null;
    localizations?: FeedbackHistoryLocalization[];
};

export interface FeedbackHistoryPublicDto {
    id: number;
    title: string;
    story: string;
    image: Image | null;
    priority: number;
    localizations?: FeedbackHistoryLocalizationDto[];
}

export interface FeedbackReviewPublicDto {
    id: number;
    authorName: string;
    text: string;
    priority: number;
    localizations?: FeedbackReviewLocalizationDto[];
}

export interface FeedbackVideoPublicDto {
    id: number;
    title: string;
    link: string;
    priority: number;
    localizations?: FeedbackVideoLocalizationDto[];
}
