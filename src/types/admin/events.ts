import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';

export interface EventLocalization extends EntityLocalization {
    title: string;
    description: string;
    additionalDescription?: string | null;
}

export interface EventItemDto extends EntityWithLocalizations<EventLocalization> {
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

export interface EventLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    title: string;
    description: string;
    additionalDescription?: string | null;
}

export type EventItemResponseDto = Omit<EventItemDto, 'localizations'> &
    EntityWithDtoLocalizations<EventLocalizationDto>;

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
