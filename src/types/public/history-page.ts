import { Image, ImageValues } from '../common/image';
import { ContentType } from '../common/section-contents';
import { SectionTemplate } from '../common/sections';
import { EntityLocalization } from '../common/language';
import { HistorySectionContentLocalizableFields } from '../common/history-sections';

export interface HistorySectionContentLocalization
    extends EntityLocalization,
        HistorySectionContentLocalizableFields {}

export interface HistorySectionContent extends HistorySectionContentLocalizableFields {
    id?: number;
    sectionId?: number;
    contentType: ContentType;
    order: number;
    image?: Image | ImageValues | null;
    imageId?: number | null;
    localizations?: HistorySectionContentLocalization[];
}

export interface HistorySection {
    id?: number;
    template: SectionTemplate;
    order: number;
    contents: HistorySectionContent[];
}
