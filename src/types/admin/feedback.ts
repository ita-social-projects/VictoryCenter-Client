import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';

export enum FeedbackCategory {
    HISTORY = 'history',
    REVIEWS = 'reviews',
    VIDEOS = 'videos',
}

export interface FeedbackHistoryDto {
    id: number;
    title: string;
    story: string;
    image: Image | ImageValues | null;
    priority: number;
    status: VisibilityStatus;
}

export interface CreateFeedbackHistoryDto {
    title: string;
    story: string;
    imageId?: number | null;
    status: VisibilityStatus;
}

export interface FeedbackReviewDto {
    id: number;
    authorName: string;
    text: string;
    status: VisibilityStatus;
    priority: number;
    createdAt?: string;
}

export interface CreateFeedbackReviewDto {
    authorName: string;
    text: string;
    status: VisibilityStatus;
}

export interface FeedbackSearchItemData {
    id: number;
    title: string;
}

export interface FeedbackCategoryItem {
    id: FeedbackCategory;
    name: string;
}

export type FeedbackListItem = FeedbackHistoryDto | FeedbackReviewDto | any;
