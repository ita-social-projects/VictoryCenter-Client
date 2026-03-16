import { ContentType, SectionType } from '../common/about-us';
import { Image } from '../common/image';
import { EntityLocalization, EntityLocalizationDto, EntityWithDtoLocalizations } from '../common/language';

export type AboutUsSection = {
    sectionType: SectionType;
    contents: AboutUsContent[];
};

export type AboutUsContent = {
    id: number;
    contentType: ContentType;
    image: Image | null;
    description: string | null;
    title: string | null;
    localizations?: AboutUsContentLocalization[];
};

export type AboutUsSectionDto = {
    sectionType: SectionType;
    contents: AboutUsContentDto[];
};

export type AboutUsContentDto = AboutUsContentLocalizableFields &
    EntityWithDtoLocalizations<AboutUsContentLocalizationDto> & {
        id: number;
        contentType: ContentType;
        image: Image | null;
    };

export type AboutUsContentLocalizationDto = EntityLocalizationDto &
    AboutUsContentLocalizableFields & {
        entityId: number;
    };

export type AboutUsContentLocalization = EntityLocalization & AboutUsContentLocalizableFields;

export type AboutUsContentLocalizableFields = {
    description: string | null;
    title: string | null;
};
