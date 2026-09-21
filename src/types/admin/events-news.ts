import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';

export interface EventsNews {
    resource: string;
    publishedAt: string;
    status: number;
}

export interface EventItemDto {
    id: number;
    resource: string;
    publishedAt: string;
    title: string;
    description: string;
    status: VisibilityStatus;
    previewImage: Image | ImageValues | null;
    backgroundImage: Image | ImageValues | null;
}

export type EventsErrorType = 'categories' | 'events' | 'search';

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
