import { Image, ImageValues } from '../common/image';
import { ContentType } from '../common/section-contents';
import { SectionTemplate } from '../common/sections';
import { EntityLocalization } from '../common/language';
import { HistorySectionContentLocalizableFields } from '../common/history-sections';

export type PhotoCaptionKey =
    | 'PHOTO_DIRECTOR_NAME'
    | 'PHOTO_DIRECTOR_ROLE'
    | 'PHOTO_VOLUNTEER_1_NAME'
    | 'PHOTO_VOLUNTEER_1_ROLE'
    | 'PHOTO_MILITARY_1_NAME'
    | 'PHOTO_MILITARY_1_ROLE'
    | 'PHOTO_PARAMEDIC_NAME'
    | 'PHOTO_PARAMEDIC_ROLE'
    | 'PHOTO_MILITARY_2_NAME'
    | 'PHOTO_MILITARY_2_ROLE'
    | 'PHOTO_VOLUNTEER_2_NAME'
    | 'PHOTO_VOLUNTEER_2_ROLE';

export interface PhotoConfig {
    src: string;
    nameKey: PhotoCaptionKey;
    roleKey: PhotoCaptionKey;
    width: number;
    height: number;
    tabletWidth?: number;
    tabletHeight?: number;
    mobileWidth?: number;
    mobileHeight?: number;
    offsetX?: number;
}

export interface LineConfig {
    xl: number;
    mobile: number;
    topAnchor?: boolean;
    showFrom: 'all' | 'tablet' | 'desktop';
    photo?: PhotoConfig;
    side: 'left' | 'right';
}

export interface HistorySectionContentLocalization extends EntityLocalization, HistorySectionContentLocalizableFields {}

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
