import { Image } from '@/types/common/image';
import { HippotherapyProgramSectionDto } from '@/types/common/program-sections';
import { EntityLocalization } from '@/types/common/language';

export interface chooseProgramData {
    title: string;
    description: string;
    imgURL?: string;
}

export interface Tag {
    id: string;
    name: string;
    localizations?: EntityLocalization[];
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
    previewImage: Image | string | { url?: string } | null; // string для моків, Image для реальних даних
    backgroundImage: Image | string | null; // string для моків, Image для реальних даних
    slug: string;
    sections: HippotherapyProgramSectionDto[];
    localizations?: EntityLocalization[];
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
    title?: string | null;
    description?: string | null;
    additionalDescription?: string | null;
    slug?: string | null;
    resource?: string | null;
    resourceEn?: string | null;
    publishedAt?: string | null;
    previewImage?: Image | null;
    backgroundImage?: Image | null;
    category?: EventNewsCategoryDto | null;
    localizations: PublishedEventNewsLocalizationDto[];
}

export interface PublicEventsPageDto {
    eventsBlockTitle?: string | null;
    pageDescription?: string | null;
    categories?: EventNewsCategoryDto[] | null;
}
