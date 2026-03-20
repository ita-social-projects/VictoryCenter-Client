import React from 'react';
import { ContentType, SectionType } from '../common/about-us';
import { Image, ImageValues } from '../common/image';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
    EntityWithTranslationStatuses,
} from '../common/language';

export type WhoWeAreCategory = EntityWithTranslationStatuses & {
    id: number;
    sectionType: SectionType;
    title: string;
};

export type WhoWeAreSection = {
    id: number;
    sectionType: SectionType;
    title: string;
    contents: Content[];
};

export type WhoWeAreSectionDto = {
    id: number;
    sectionType: SectionType;
    title: string;
    contents: ContentDto[];
};

export type Content = ContentLocalizableFields &
    EntityWithLocalizations<ContentLocalization> & {
        id: number;
        contentType: ContentType;
        image: Image | ImageValues | null;
        imageId: number | null;
    };

export type ContentDto = ContentLocalizableFields &
    EntityWithDtoLocalizations<ContentLocalizationDto> & {
        id: number;
        contentType: ContentType;
        image: Image | ImageValues | null;
        imageId: number | null;
    };

export type ContentLocalizationDto = EntityLocalizationDto &
    ContentLocalizableFields & {
        entityId: number;
    };

export type ContentLocalization = EntityLocalization & ContentLocalizableFields;

export type ContentLocalizableFields = {
    description: string | null;
    title: string | null;
};
export interface CardImageConfig {
    style: React.CSSProperties;
    subText: string;
    cropWidth: number;
    cropHeight: number;
    minWidth: number;
    minHeight: number;
}
