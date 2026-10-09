import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
    EntityWithTranslationStatuses,
    LocalizationInfo,
    TranslationStatus,
} from '@/types/common/language';

import { Image, ImageValues } from '@/types/common/image';

export enum HippotherapyPageLocalizationBlock {
    Intro = 0,
    Description = 1,
    Quote = 2,
    Hippovention = 3,
    HippoventionCenter = 4,
    Advantages = 5,
    Analysis = 6,
    ScientificReferences = 7,
    AnotherQuote = 8,
    Participants = 9,
    Ethics = 10,
}

export interface HippotherapyTextCardLocalizedContent {
    title: string;
    description: string;
}
export interface HippotherapyQuoteLocalizedContent {
    quoteText: string;
    authorName: string;
}
export interface HippotherapyGalleryLocalizedContent {
    title: string;
    cards: { description: string }[];
}
export interface HippoventionCenterLocalizedContent {
    title: string;
    pros: string;
    description: string;
}
export interface HippotherapyScientificReferencesLocalizedContent {
    title: string;
    description: string;
    scientificReferences: { id: number; name: string }[];
}
export interface HippotherapyEthicsLocalizedContent {
    title: string;
    description: string;
    principles: string[];
}

export interface HippotherapyPageLocalizedContent {
    introSection: HippotherapyTextCardLocalizedContent;
    descriptionSection: HippotherapyTextCardLocalizedContent;
    quoteSection: HippotherapyQuoteLocalizedContent;
    hippoventionSection: HippotherapyTextCardLocalizedContent;
    hippoventionCenterSection: HippoventionCenterLocalizedContent;
    advantagesSection: HippotherapyGalleryLocalizedContent;
    analysisSection: HippotherapyTextCardLocalizedContent;
    scientificReferencesSection: HippotherapyScientificReferencesLocalizedContent;
    anotherQuoteSection: HippotherapyQuoteLocalizedContent;
    participantsSection: HippotherapyGalleryLocalizedContent;
    ethicsSection: HippotherapyEthicsLocalizedContent;
}

export type HippotherapyPageLocalizedPartial = {
    [K in keyof HippotherapyPageLocalizedContent]?: Partial<HippotherapyPageLocalizedContent[K]> | null;
};

export interface HippotherapyPageLocalization extends EntityLocalization, HippotherapyPageLocalizedPartial {
    entityId?: number;
    languageId?: number;
}

export interface HippotherapyPageEmbeddedLocalizationDto
    extends EntityLocalizationDto,
        HippotherapyPageLocalizedPartial {
    entityId?: number;
}

export type HippotherapyPageLocalizedSections = {
    [K in keyof HippotherapyPageLocalizedContent]: HippotherapyPageLocalizedContent[K] | null;
};

export interface HippotherapyPageLocalizationDto extends HippotherapyPageLocalizedSections {
    entityId: number;
    translationStatus: TranslationStatus;
    localizationInfoDto: LocalizationInfo;
}

export interface CreateHippotherapyPageLocalizationDto extends Partial<HippotherapyPageLocalizedSections> {
    entityId: number;
    languageId: number;
}

export interface UpdateHippotherapyPageLocalizationDto extends Partial<HippotherapyPageLocalizedSections> {}

export interface HippotherapyPageTranslationStatusDto {
    block: HippotherapyPageLocalizationBlock;
    entityId: number | null;
    languageId: number;
    translationStatus: TranslationStatus | null;
}

export interface HippotherapyImageValue {
    image: Image | ImageValues | null;
    imageId: number | null;
}

export interface HippotherapyIntroSectionContent extends HippotherapyImageValue {
    title: string;
    description: string;
}

export interface HippotherapyTextCardContent {
    title: string;
    description: string;
}

export interface HippotherapyQuoteContent extends HippotherapyImageValue {
    quoteText: string;
    authorName: string;
}

export interface HippotherapyGalleryCardContent extends HippotherapyImageValue {
    description: string;
}

export interface HippotherapyGallerySectionContent {
    title: string;
    cards: HippotherapyGalleryCardContent[];
}

export interface HippoventionCenterSectionContent extends HippotherapyImageValue {
    title: string;
    pros: string;
    description: string;
}

export interface HippotherapyScientificReference {
    localId: string;
    id: number | null;
    name: string;
    url: string;
}

export interface HippotherapyScientificReferencesSectionContent {
    title: string;
    description: string;
    scientificReferences: HippotherapyScientificReference[];
}

export interface HippotherapyScientificReferenceDto {
    id: number | null;
    name: string;
    url: string;
}

export interface HippotherapyEthicsSectionContent extends HippotherapyImageValue {
    title: string;
    description: string;
    principles: string[];
}

export interface HippotherapyPageContentModel extends EntityWithLocalizations<HippotherapyPageLocalization>, EntityWithTranslationStatuses{
    id?: number;
    introSection: HippotherapyIntroSectionContent;
    descriptionSection: HippotherapyTextCardContent;
    quoteSection: HippotherapyQuoteContent;
    hippoventionSection: HippotherapyTextCardContent;
    hippoventionCenterSection: HippoventionCenterSectionContent;
    advantagesSection: HippotherapyGallerySectionContent;
    analysisSection: HippotherapyTextCardContent;
    scientificReferencesSection: HippotherapyScientificReferencesSectionContent;
    anotherQuoteSection: HippotherapyQuoteContent;
    participantsSection: HippotherapyGallerySectionContent;
    ethicsSection: HippotherapyEthicsSectionContent;
}

export interface HippotherapyPageContentDto extends Omit<HippotherapyPageContentModel, 'scientificReferencesSection' | 'localizations'>,
    EntityWithDtoLocalizations<HippotherapyPageLocalizationDto>{
    scientificReferencesSection: {
        title: string;
        description: string;
        scientificReferences: HippotherapyScientificReferenceDto[];
    };
}
