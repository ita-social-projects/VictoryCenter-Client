import { getEthicsPrincipleFieldName, getGalleryCardDescriptionFieldName } from '@/const/admin/hippotherapy-page';
import { TranslateHippotherapySectionFormValues } from '@/pages/admin/hippotherapy-page/components/translate-section-form/TranslateHippotherapySectionForm';
import {
    CreateEthicsSectionDto,
    CreateGallerySectionDto,
    CreateHippoventionCenterSectionDto,
    CreateQuoteSectionDto,
    CreateTextCardSectionDto,
    HippotherapyPageLocalizationBlock,
    UpdateEthicsSectionDto,
    UpdateGallerySectionDto,
    UpdateHippoventionCenterSectionDto,
    UpdateQuoteSectionDto,
    UpdateTextCardSectionDto,
} from '@/types/admin/hippotherapy-page';

export interface SectionMapContext {
    entityId: number;
    languageId: number;
}

export interface GallerySectionMapContext extends SectionMapContext {
    cardIds: number[];
}

export interface ScientificReferencesSectionMapContext extends SectionMapContext {
    referenceIds: number[];
}

export interface EthicsSectionMapContext extends SectionMapContext {
    principleIds: number[];
}

export const mapFormValuesToTextCardSectionDto = (
    values: TranslateHippotherapySectionFormValues,
): UpdateTextCardSectionDto => ({
    title: values.title ?? '',
    description: values.description ?? '',
});

export const mapFormValuesToCreateTextCardSectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: SectionMapContext,
): CreateTextCardSectionDto => ({
    ...mapFormValuesToTextCardSectionDto(values),
    entityId: context.entityId,
    languageId: context.languageId,
});

export const mapFormValuesToQuoteSectionDto = (
    values: TranslateHippotherapySectionFormValues,
): UpdateQuoteSectionDto => ({
    quoteText: values.quoteText ?? '',
    authorName: values.authorName || null,
});

export const mapFormValuesToCreateQuoteSectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: SectionMapContext,
): CreateQuoteSectionDto => ({
    ...mapFormValuesToQuoteSectionDto(values),
    entityId: context.entityId,
    languageId: context.languageId,
});

export const mapFormValuesToHippoventionCenterSectionDto = (
    values: TranslateHippotherapySectionFormValues,
): UpdateHippoventionCenterSectionDto => ({
    title: values.title ?? '',
    description: values.description ?? '',
    pros: values.pros ?? '',
});

export const mapFormValuesToCreateHippoventionCenterSectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: SectionMapContext,
): CreateHippoventionCenterSectionDto => ({
    ...mapFormValuesToHippoventionCenterSectionDto(values),
    entityId: context.entityId,
    languageId: context.languageId,
});

export const mapFormValuesToGallerySectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: GallerySectionMapContext,
): UpdateGallerySectionDto => ({
    title: values.title ?? '',
    cards: context.cardIds.map((cardId) => ({
        cardId,
        description: values[getGalleryCardDescriptionFieldName(cardId)] ?? '',
    })),
});

export const mapFormValuesToCreateGallerySectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: GallerySectionMapContext,
): CreateGallerySectionDto => ({
    ...mapFormValuesToGallerySectionDto(values, context),
    entityId: context.entityId,
    languageId: context.languageId,
});

export const mapFormValuesToEthicsSectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: EthicsSectionMapContext,
): UpdateEthicsSectionDto => ({
    title: values.title ?? '',
    description: values.description ?? '',
    principles: context.principleIds.map((principleId) => ({
        principleId,
        text: values[getEthicsPrincipleFieldName(principleId)] ?? '',
    })),
});

export const mapFormValuesToCreateEthicsSectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: EthicsSectionMapContext,
): CreateEthicsSectionDto => ({
    ...mapFormValuesToEthicsSectionDto(values, context),
    entityId: context.entityId,
    languageId: context.languageId,
});

export const mapHippotherapySectionFormValuesToDto = (
    block: HippotherapyPageLocalizationBlock,
    values: TranslateHippotherapySectionFormValues,
    context: SectionMapContext | GallerySectionMapContext | EthicsSectionMapContext,
    isUpdate: boolean,
) => {
    switch (block) {
        case HippotherapyPageLocalizationBlock.Intro:
        case HippotherapyPageLocalizationBlock.Description:
        case HippotherapyPageLocalizationBlock.Hippovention:
        case HippotherapyPageLocalizationBlock.Analysis:
            return isUpdate
                ? mapFormValuesToTextCardSectionDto(values)
                : mapFormValuesToCreateTextCardSectionDto(values, context);
        case HippotherapyPageLocalizationBlock.Quote:
        case HippotherapyPageLocalizationBlock.AnotherQuote:
            return isUpdate
                ? mapFormValuesToQuoteSectionDto(values)
                : mapFormValuesToCreateQuoteSectionDto(values, context);
        case HippotherapyPageLocalizationBlock.HippoventionCenter:
            return isUpdate
                ? mapFormValuesToHippoventionCenterSectionDto(values)
                : mapFormValuesToCreateHippoventionCenterSectionDto(values, context);
        case HippotherapyPageLocalizationBlock.Advantages:
        case HippotherapyPageLocalizationBlock.Participants:
            return isUpdate
                ? mapFormValuesToGallerySectionDto(values, context as GallerySectionMapContext)
                : mapFormValuesToCreateGallerySectionDto(values, context as GallerySectionMapContext);
        case HippotherapyPageLocalizationBlock.Ethics:
            return isUpdate
                ? mapFormValuesToEthicsSectionDto(values, context as EthicsSectionMapContext)
                : mapFormValuesToCreateEthicsSectionDto(values, context as EthicsSectionMapContext);
        default:
            return null;
    }
};
