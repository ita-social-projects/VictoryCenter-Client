import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
    EntityWithTranslationStatuses,
    LocalizationInfo,
    TranslationStatus,
    TranslationStatusInfo,
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

export type CreateSectionDto<TContent> = TContent & {
    entityId: number;
    languageId: number;
};

export type UpdateSectionDto<TContent> = TContent;

export interface HippotherapyTextCardLocalizedContent {
    title: string;
    description: string;
}

export interface HippotherapyQuoteLocalizedContent {
    quoteText: string;
    authorName: string | null;
}

export interface HippotherapyGalleryLocalizedContent {
    title: string;
    cards: { cardId: number; description: string }[];
}

export interface HippoventionCenterLocalizedContent {
    title: string;
    pros: string;
    description: string;
}

export interface HippotherapyScientificReferencesLocalizedContent {
    title: string;
    description: string;
    references?: { referenceId: number; name: string }[];
}

export interface HippotherapyEthicsLocalizedContent {
    title: string;
    description: string;
    principles: { principleId: number; text: string }[];
}

export interface HippotherapyGalleryCardItem {
    cardId: number;
    description: string;
}

export interface HippotherapyGalleryLocalizedContentDto {
    title: string;
    cards: HippotherapyGalleryCardItem[];
}

export interface HippotherapyScientificReferenceItem {
    referenceId: number;
    name: string;
}

export interface HippotherapyScientificReferencesLocalizedContentDto {
    title: string;
    description: string;
    references: HippotherapyScientificReferenceItem[];
}

export interface HippotherapyEthicsPrincipleItem {
    principleId: number;
    text: string;
}

export interface HippotherapyEthicsLocalizedContentDto {
    title: string;
    description: string;
    principles: HippotherapyEthicsPrincipleItem[];
}

export type CreateGallerySectionDto = CreateSectionDto<HippotherapyGalleryLocalizedContentDto>;
export type UpdateGallerySectionDto = UpdateSectionDto<HippotherapyGalleryLocalizedContentDto>;

export type CreateScientificReferencesSectionDto =
    CreateSectionDto<HippotherapyScientificReferencesLocalizedContentDto>;
export type UpdateScientificReferencesSectionDto =
    UpdateSectionDto<HippotherapyScientificReferencesLocalizedContentDto>;

export type CreateEthicsSectionDto = CreateSectionDto<HippotherapyEthicsLocalizedContentDto>;
export type UpdateEthicsSectionDto = UpdateSectionDto<HippotherapyEthicsLocalizedContentDto>;

export type CreateTextCardSectionDto = CreateSectionDto<HippotherapyTextCardLocalizedContent>;
export type UpdateTextCardSectionDto = UpdateSectionDto<HippotherapyTextCardLocalizedContent>;

export type CreateQuoteSectionDto = CreateSectionDto<HippotherapyQuoteLocalizedContent>;
export type UpdateQuoteSectionDto = UpdateSectionDto<HippotherapyQuoteLocalizedContent>;

export type CreateHippoventionCenterSectionDto = CreateSectionDto<HippoventionCenterLocalizedContent>;
export type UpdateHippoventionCenterSectionDto = UpdateSectionDto<HippoventionCenterLocalizedContent>;

export interface HippotherapyTextCardSectionLocalizationDto
    extends EntityLocalizationDto,
        HippotherapyTextCardLocalizedContent {
    entityId: number;
}

export interface HippotherapyQuoteSectionLocalizationDto
    extends EntityLocalizationDto,
        HippotherapyQuoteLocalizedContent {
    entityId: number;
}

export interface HippoventionCenterSectionLocalizationDto
    extends EntityLocalizationDto,
        HippoventionCenterLocalizedContent {
    entityId: number;
}

export interface HippotherapyGallerySectionLocalizationDto
    extends EntityLocalizationDto,
        HippotherapyGalleryLocalizedContentDto {
    entityId: number;
}

export interface HippotherapyScientificReferencesSectionLocalizationDto
    extends EntityLocalizationDto,
        HippotherapyScientificReferencesLocalizedContentDto {
    entityId: number;
}

export interface HippotherapyEthicsSectionLocalizationDto
    extends EntityLocalizationDto,
        HippotherapyEthicsLocalizedContentDto {
    entityId: number;
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
        Omit<HippotherapyPageLocalizedPartial, 'scientificReferencesSection'> {
    entityId?: number;
    scientificReferencesSection?: Partial<HippotherapyScientificReferencesLocalizedContentDto> | null;
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
    id: number;
    title: string;
    description: string;
}

export interface HippotherapyTextCardContent {
    id: number;
    title: string;
    description: string;
}

export interface HippotherapyQuoteContent extends HippotherapyImageValue {
    id: number;
    quoteText: string;
    authorName: string;
}

export interface HippotherapyGalleryCardContent extends HippotherapyImageValue {
    id: number;
    description: string;
}

export interface HippotherapyGallerySectionContent {
    id: number;
    title: string;
    cards: HippotherapyGalleryCardContent[];
}

export interface HippoventionCenterSectionContent extends HippotherapyImageValue {
    id: number;
    title: string;
    pros: string;
    description: string;
}

export interface HippotherapyScientificReference {
    localId: string;
    id: number;
    name: string;
    url: string;
}

export interface HippotherapyScientificReferencesSectionContent {
    id: number;
    title: string;
    description: string;
    scientificReferences: HippotherapyScientificReference[];
}

export interface HippotherapyScientificReferenceDto {
    id: number;
    name: string;
    url: string;
}

export interface HippotherapyEthicsPrinciple {
    id: number | null;
    text: string;
}

export interface HippotherapyEthicsSectionContent extends HippotherapyImageValue {
    id: number;
    title: string;
    description: string;
    principles: HippotherapyEthicsPrinciple[];
}

export interface HippotherapyEthicsPrinciple {
    id: number;
    text: string;
}

export type HippotherapyPageTranslationStatusInfo = TranslationStatusInfo & {
    block: HippotherapyPageLocalizationBlock;
};

export interface HippotherapyPageContentModel
    extends EntityWithLocalizations<HippotherapyPageLocalization>,
        EntityWithTranslationStatuses {
    id?: number;
    translationStatuses: HippotherapyPageTranslationStatusInfo[];
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

export interface HippotherapyPageContentDto
    extends Omit<HippotherapyPageContentModel, 'scientificReferencesSection' | 'localizations' | 'translationStatuses'>,
        EntityWithDtoLocalizations<HippotherapyPageEmbeddedLocalizationDto> {
    translationStatuses?: HippotherapyPageTranslationStatusDto[];
    scientificReferencesSection: {
        id: number;
        title: string;
        description: string;
        scientificReferences: HippotherapyScientificReferenceDto[];
    };
}

export type UpdateHippotherapyPageContentDto = Omit<
    HippotherapyPageContentDto,
    'localizations' | 'translationStatuses'
>;
