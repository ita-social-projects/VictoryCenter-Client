import { Image, ImageValues } from '../common/image';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
    TranslationStatus,
} from './language';
import { ContentType } from './section-contents';
import { SectionTemplate } from './sections';

export interface HistorySectionContentDto
    extends HistorySectionContentLocalizableFields,
        EntityWithDtoLocalizations<HistorySectionContentLocalizationDto> {
    id?: number;
    sectionId?: number;
    contentType: ContentType;
    order: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    imageId?: number | null;
}
export interface HistorySectionContent
    extends HistorySectionContentLocalizableFields,
        EntityWithLocalizations<HistorySectionContentLocalization> {
    id?: number;
    sectionId?: number;
    contentType: ContentType;
    order: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    imageId?: number | null;
}
export interface HistorySectionContentLocalizableFields {
    title?: string | null;
    description?: string | null;
}

export interface HistorySectionDto {
    id?: number;
    programId?: number;
    template: SectionTemplate;
    order: number;
    contents: HistorySectionContentDto[];
}
export interface HistorySection {
    id?: number;
    programId?: number;
    template: SectionTemplate;
    order: number;
    contents: HistorySectionContent[];
}

export interface HistorySectionContentLocalizationDto
    extends EntityLocalizationDto,
        HistorySectionContentLocalizableFields {
    entityId: number;
}
export interface HistorySectionContentLocalization extends EntityLocalization, HistorySectionContentLocalizableFields {}

export interface CreateUpdateHistorySectionDto {
    id?: number;
    template: SectionTemplate;
    order: number;
    contents: CreateHistorySectionContentDto[];
}

export interface CreateHistorySectionContentDto {
    id?: number;
    contentType: ContentType;
    order: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    imageId?: number | null;
}

export interface CreateHistorySectionContentLocalizationDto {
    entityId: number;
    languageId: number;
    title?: string | null;
    description?: string | null;
    translationStatus?: TranslationStatus;
}

export interface CreateHistorySectionLocalizationDto {
    entityId: number;
    languageId: number;
    contents: CreateHistorySectionContentLocalizationDto[];
}
