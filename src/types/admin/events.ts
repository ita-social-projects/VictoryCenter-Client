import { Image, ImageValues } from '../common/image';
import { EntityLocalization, EntityLocalizationDto } from '../common/language';
import { VisibilityStatus } from './common';

export interface EventLocalizableFields {
    title: string;
    description: string;
    additionalDescription?: string | null;
}

export interface EventLocalization extends EntityLocalization, EventLocalizableFields {}

export interface EventLocalizationDto extends EntityLocalizationDto, EventLocalizableFields {
    entityId?: number;
}

export interface CreateEventLocalizationDto extends EventLocalizableFields {
    entityId: number;
    languageId: number;
}

export type UpdateEventLocalizationDto = EventLocalizableFields;

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
    localizations?: EventLocalization[];
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
}

export type EventsIntroSectionUpdateField = keyof EventsIntroSectionDto;
