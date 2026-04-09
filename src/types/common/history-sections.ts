import { Image, ImageValues } from '../common/image';
import { ContentType } from './section-contents';
import { SectionTemplate } from './sections';

export interface HistorySectionContentDto {
    id?: number;
    sectionId?: number;
    contentType: ContentType;
    order: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    imageId?: number | null;
}

export interface HistorySectionDto {
    id?: number;
    programId?: number;
    template: SectionTemplate;
    order: number;
    contents: HistorySectionContentDto[];
}
