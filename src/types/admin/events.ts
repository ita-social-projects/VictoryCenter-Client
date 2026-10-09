import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';

export interface EventItemDto {
    id: number;
    resource: string;
    resourceEn?: string | null;
    publishedAt: string;
    title: string;
    description: string;
    additionalDescription?: string | null;
    status: VisibilityStatus;
    previewImage: Image | ImageValues | null;
    backgroundImage: Image | ImageValues | null;
    priority: number;
}

export interface EventCategoryReference {
    id: number;
}

export interface EventLocalizationDetails {
    language: {
        id: number;
    };
    title: string;
    description?: string | null;
    additionalDescription?: string | null;
}

export interface EventDetailsDto extends EventItemDto {
    categories: EventCategoryReference[];
    localizations: EventLocalizationDetails[];
}

export interface EventLocalizationRequest {
    languageId: number;
    title: string;
    description: string;
    additionalDescription: string;
}

export interface EventCreateUpdateRequest {
    title: string;
    description: string;
    additionalDescription: string;
    resource: string;
    resourceEn: string;
    publishedAt: string | null;
    status: VisibilityStatus;
    previewImageId: number | null;
    backgroundImageId: number | null;
    categoryIds: number[];
    localizations: EventLocalizationRequest[];
}

export interface EventSaveSuccessData {
    event: EventItemDto;
    categoryId: number | null;
    isFirstPublication: boolean;
    shouldMoveDraftToTop: boolean;
}

export type EventsErrorType = 'categories' | 'events-items' | 'events-intro' | 'search' | 'events-reorder';

export interface ErrorState {
    message: string | null;
    type: EventsErrorType | null;
}

// this is a test interface and most probably will need adjustments in the future
export interface EventSearchItemData {
    id: number;
    name: string;
    categories: string[];
}

// this is a test interface and most probably will need adjustments in the future
export interface EventsLocalizableFields {
    name: string;
    description: string;
    location: string;
    participantsCount: string;
    meetingsCount: string;
}

export interface EventsIntroSectionDto {
    eventsBlockTitle: string;
    pageDescription: string;
    isEventsBlockTitleHidden: boolean;
    isPageDescriptionHidden: boolean;
}

export type EventsIntroSectionUpdateField = keyof EventsIntroSectionDto;
