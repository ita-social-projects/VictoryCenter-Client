import { getEthicsPrincipleFieldName, getGalleryCardDescriptionFieldName } from '@/const/admin/hippotherapy-page';
import { TranslateHippotherapySectionFormValues } from '@/pages/admin/hippotherapy-page/components/translate-section-form/TranslateHippotherapySectionForm';
import { HippotherapyTranslationSubBlock } from '@/pages/admin/hippotherapy-page/components/translate-section-modal/TranslateHippotherapySectionModal';
import {
    CreateEthicsSectionDto,
    CreateGallerySectionDto,
    CreateHippoventionCenterSectionDto,
    CreateQuoteSectionDto,
    CreateScientificReferencesSectionDto,
    CreateTextCardSectionDto,
    HippotherapyPageLocalizationBlock,
    HippotherapyPageLocalizedContent,
    HippotherapyPageLocalizedPartial,
    HippotherapyScientificReference,
    HippotherapyScientificReferenceItem,
    UpdateEthicsSectionDto,
    UpdateGallerySectionDto,
    UpdateHippoventionCenterSectionDto,
    UpdateQuoteSectionDto,
    UpdateScientificReferencesSectionDto,
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
    subBlock?: HippotherapyTranslationSubBlock | null;
    targetResearchLocalId?: string | null;
    existingSectionLocalization?: HippotherapyPageLocalizedPartial['scientificReferencesSection'] | null;
    scientificReferences: HippotherapyScientificReference[];
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

export const mapFormValuesToScientificReferencesSectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: ScientificReferencesSectionMapContext,
): UpdateScientificReferencesSectionDto => {
    const { subBlock, targetResearchLocalId, existingSectionLocalization, scientificReferences } = context;

    const existingReferences: HippotherapyScientificReferenceItem[] = (
        existingSectionLocalization?.scientificReferences ?? []
    )
        .filter((ref) => Boolean(ref.name.trim()))
        .map((ref) => ({
            referenceId: ref.id,
            name: ref.name ?? '',
        }));

    if (subBlock === 'research') {
        const title = existingSectionLocalization?.title ?? '';
        const description = existingSectionLocalization?.description ?? '';

        const currentReference = (scientificReferences ?? []).find((ref) => ref.localId === targetResearchLocalId);
        const currentReferenceId = currentReference?.id;
        const newReferenceName = values.name ?? '';

        let updatedReferences: HippotherapyScientificReferenceItem[];

        if (currentReferenceId != null && currentReferenceId > 0) {
            const isAlreadyInList = existingReferences.some((ref) => ref.referenceId === currentReferenceId);

            if (isAlreadyInList) {
                updatedReferences = existingReferences.map((ref) =>
                    ref.referenceId === currentReferenceId ? { ...ref, name: newReferenceName } : ref,
                );
            } else {
                updatedReferences = [
                    ...existingReferences,
                    { referenceId: currentReferenceId, name: newReferenceName },
                ];
            }
        } else {
            updatedReferences = existingReferences;
        }

        return {
            title,
            description,
            references: updatedReferences,
        };
    }

    return {
        title: values.title ?? '',
        description: values.description ?? '',
        references: existingReferences,
    };
};

export const mapFormValuesToCreateScientificReferencesSectionDto = (
    values: TranslateHippotherapySectionFormValues,
    context: ScientificReferencesSectionMapContext,
): CreateScientificReferencesSectionDto => ({
    ...mapFormValuesToScientificReferencesSectionDto(values, context),
    entityId: context.entityId,
    languageId: context.languageId,
});

export const mapHippotherapySectionFormValuesToDto = (
    block: HippotherapyPageLocalizationBlock,
    values: TranslateHippotherapySectionFormValues,
    context:
        | SectionMapContext
        | GallerySectionMapContext
        | EthicsSectionMapContext
        | ScientificReferencesSectionMapContext,
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
        case HippotherapyPageLocalizationBlock.ScientificReferences:
            return isUpdate
                ? mapFormValuesToScientificReferencesSectionDto(
                      values,
                      context as ScientificReferencesSectionMapContext,
                  )
                : mapFormValuesToCreateScientificReferencesSectionDto(
                      values,
                      context as ScientificReferencesSectionMapContext,
                  );
        default:
            return null;
    }
};
