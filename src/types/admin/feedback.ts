import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';

export enum FeedbackCategory {
    HISTORY = 'history',
    REVIEWS = 'reviews',
    VIDEOS = 'videos',
}

export interface FeedbackHistoryLocalization extends EntityLocalization {
    title: string;
    story: string;
}

export interface FeedbackHistoryDto extends EntityWithLocalizations<FeedbackHistoryLocalization> {
    id: number;
    title: string;
    story: string;
    image: Image | ImageValues | null;
    priority: number;
    status: VisibilityStatus;
}

export interface FeedbackHistoryLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    title: string;
    story: string;
}

export type FeedbackHistoryResponseDto = Omit<FeedbackHistoryDto, 'localizations'> &
    EntityWithDtoLocalizations<FeedbackHistoryLocalizationDto>;

export interface CreateFeedbackHistoryDto {
    title: string;
    story: string;
    imageId?: number | null;
    status: VisibilityStatus;
}

export interface UpdateFeedbackHistoryDto {
    title: string;
    story: string;
    imageId?: number | null;
    status: VisibilityStatus;
}

export type CreateFeedbackHistoryLocalizationDto = {
    entityId: number;
    languageId: number;
    title: string;
    story: string;
};

export type UpdateFeedbackHistoryLocalizationDto = {
    title: string;
    story: string;
};

export interface FeedbackReviewLocalization extends EntityLocalization {
    authorName: string;
    text: string;
}

export interface FeedbackReviewDto extends EntityWithLocalizations<FeedbackReviewLocalization> {
    id: number;
    authorName: string;
    text: string;
    status: VisibilityStatus;
    priority: number;
    createdAt?: string;
}

export interface FeedbackReviewLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    authorName: string;
    text: string;
}

export type FeedbackReviewResponseDto = Omit<FeedbackReviewDto, 'localizations'> &
    EntityWithDtoLocalizations<FeedbackReviewLocalizationDto>;

export interface CreateFeedbackReviewDto {
    authorName: string;
    text: string;
    status: VisibilityStatus;
}

export type CreateFeedbackReviewLocalizationDto = {
    entityId: number;
    languageId: number;
    authorName: string;
    text: string;
};

export type UpdateFeedbackReviewLocalizationDto = {
    authorName: string;
    text: string;
};

export interface FeedbackSearchItemData {
    id: number;
    title: string;
}

export interface FeedbackCategoryItem {
    id: FeedbackCategory;
    name: string;
}

export interface FeedbackVideoLocalization extends EntityLocalization {
    title: string;
}

export interface FeedbackVideoDto extends EntityWithLocalizations<FeedbackVideoLocalization> {
    id: number;
    title: string;
    link: string;
    status: VisibilityStatus;
    priority: number;
}

export interface FeedbackVideoLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    title: string;
}

export type FeedbackVideoResponseDto = Omit<FeedbackVideoDto, 'localizations'> &
    EntityWithDtoLocalizations<FeedbackVideoLocalizationDto>;

export type CreateFeedbackVideoLocalizationDto = {
    entityId: number;
    languageId: number;
    title: string;
};

export type UpdateFeedbackVideoLocalizationDto = {
    title: string;
};

export type FeedbackListItem = FeedbackHistoryDto | FeedbackReviewDto | FeedbackVideoDto;
