import { Image } from '../common/image';
import { HippotherapyProgramSectionDto } from '../common/program-sections';
export interface chooseProgramData {
    title: string;
    description: string;
    imgURL?: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface EventsData {
    title?: string;
    tags: Tag[];
}

export interface EventsNewsPageData {
    description: string;
    chooseProgram: chooseProgramData;
    eventsData: EventsData;
}

export interface EventsNews {
    id: string;
    name: string;
    resource?: string;
    description: string;
    date: string;
    tags: Tag[];
    previewImage: Image | string | null; // string для моків, Image для реальних даних
    backgroundImage: Image | string | null; // string для моків, Image для реальних даних
    slug: string;
    sections: HippotherapyProgramSectionDto[];
}

export interface EventNewsCategoryLocalizationDto {
    languageCode: string;
    name: string;
}

export interface EventNewsCategoryDto {
    id: number;
    name: string;
    localizations: EventNewsCategoryLocalizationDto[];
}

export interface PublishedEventNewsLocalizationDto {
    languageCode: string;
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
    categories: EventNewsCategoryDto[];
    localizations: PublishedEventNewsLocalizationDto[];
}

export interface PublicEventsPageDto {
    eventsBlockTitle?: string | null;
    pageDescription?: string | null;
    categories?: EventNewsCategoryDto[] | null;
}
