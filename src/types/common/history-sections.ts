import { Image, ImageValues } from '../common/image';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from './language';
import { ContentType } from './section-contents';
import { SectionTemplate } from './sections';

export interface HistorySectionContentDto
    extends HistoryLocalizableFields,
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
    extends HistoryLocalizableFields,
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
export interface HistoryLocalizableFields {
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

export interface HistorySectionContentLocalizationDto extends EntityLocalizationDto, HistoryLocalizableFields {
    entityId: number;
}
export interface HistorySectionContentLocalization extends EntityLocalization, HistoryLocalizableFields {}

export interface CreateUpdateHistorySectionDto {
    template: SectionTemplate;
    order: number;
    contents: CreateHistorySectionContentDto[];
}

export interface CreateHistorySectionContentDto {
    contentType: ContentType;
    order: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    imageId?: number | null;
}
