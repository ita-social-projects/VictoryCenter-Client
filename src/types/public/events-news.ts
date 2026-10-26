import { Image } from '@/types/common/image';

export interface chooseProgramData {
    title: string;
    description: string;
    imgURL?: string;
}

export interface Tag {
    id: string;
    name: string;
    localizations?: EventNewsCategoryLocalizationDto[];
}

export interface EventsData {
    title?: string;
    tags: Tag[];
}

export interface EventsNewsPageData {
    description: string;
    isPageDescriptionHidden?: boolean;
    eventsData: EventsData;
    isEventsBlockTitleHidden?: boolean;
}

export interface EventsNews {
    id: string;
    name: string;
    resource?: string;
    description: string;
    date: string;
    tag?: Tag;
    tags?: Tag[];
    previewImage: Image | string | { url?: string } | null;
    backgroundImage: Image | string | null;
    slug: string;
    localizations?: PublishedEventNewsLocalizationDto[];
}

export interface LocalizationLanguageDto {
    id?: number;
    code: string;
}

export interface EventNewsCategoryLocalizationDto {
    language: LocalizationLanguageDto;
    name: string;
}

export interface EventNewsCategoryDto {
    id: number;
    name: string;
    localizations: EventNewsCategoryLocalizationDto[];
}

export interface PublishedEventNewsLocalizationDto {
    language: LocalizationLanguageDto;
    title?: string | null;
    description?: string | null;
    additionalDescription?: string | null;
    resource?: string | null;
}

export interface PublishedEventNewsDto {
    id: number;
    title: string;
    description: string;
    additionalDescription?: string;
    slug: string;
    resource?: string;
    resourceEn?: string;
    publishedAt: string;
    previewImage?: Image;
    backgroundImage?: Image | null;
    category?: EventNewsCategoryDto;
    localizations?: PublishedEventNewsLocalizationDto[];
}

export interface PublicEventsPageDto {
    eventsBlockTitle?: string | null;
    pageDescription?: string | null;
    categories?: EventNewsCategoryDto[] | null;
}
