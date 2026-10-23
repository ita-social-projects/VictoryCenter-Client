import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';

export interface EventLocalizableFields {
    title: string;
    description: string;
    additionalDescription?: string | null;
}

export interface EventLocalization extends EntityLocalization, EventLocalizableFields {}

export interface EventLocalizationDto extends EntityLocalizationDto, EventLocalizableFields {
    entityId: number;
}

export interface CreateEventLocalizationDto extends EventLocalizableFields {
    entityId: number;
    languageId: number;
}

export type UpdateEventLocalizationDto = EventLocalizableFields;

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
    categories?: EventSearchItemCategory[];
}

export type EventItemResponseDto = Omit<EventItemDto, 'localizations'> &
    EntityWithDtoLocalizations<EventLocalizationDto>;
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

export interface EventDetailsDto extends Omit<EventItemDto, 'localizations'> {
    category: EventCategoryReference;
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
    categoryId: number;
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

export interface EventSearchItemCategory {
    id: number;
    name: string;
}

// this is a test interface and most probably will need adjustments in the future
export interface EventsLocalizableFields {
    name: string;
    description: string;
    location: string;
    participantsCount: string;
    meetingsCount: string;
}

export interface EventsIntroSectionLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    eventsBlockTitle: string;
    pageDescription: string;
}

export interface EventsIntroSectionLocalization extends EntityLocalization {
    entityId: number;
    eventsBlockTitle: string;
    pageDescription: string;
}

export interface EventsIntroSectionDto extends EntityWithLocalizations<EventsIntroSectionLocalization> {
    id: number;
    eventsBlockTitle: string;
    pageDescription: string;
    isEventsBlockTitleHidden: boolean;
    isPageDescriptionHidden: boolean;
}

export type EventsIntroSectionResponseDto = Omit<EventsIntroSectionDto, 'localizations'> &
    EntityWithDtoLocalizations<EventsIntroSectionLocalizationDto>;

export type EventsIntroSectionUpdateField = keyof EventsIntroSectionDto;
