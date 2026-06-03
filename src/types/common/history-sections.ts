import { Image, ImageValues } from '../common/image';
import { ContentType } from './section-contents';
import { SectionTemplate } from './sections';
import { EntityLocalizationDto } from './language';

export interface HistorySectionContentLocalizableFields {
    title?: string | null;
    description?: string | null;
}

export interface HistorySectionContentLocalizationDto
    extends EntityLocalizationDto,
        HistorySectionContentLocalizableFields {
    entityId: number;
    languageId?: number;
}

export interface HistorySectionContentDto extends HistorySectionContentLocalizableFields {
    id?: number;
    sectionId?: number;
    contentType: ContentType;
    order: number;
    image?: Image | ImageValues | null;
    imageId?: number | null;
    localizations?: HistorySectionContentLocalizationDto[];
}

export interface HistorySectionDto {
    id?: number;
    programId?: number;
    template: SectionTemplate;
    order: number;
    contents: HistorySectionContentDto[];
}

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
