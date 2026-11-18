import { useCallback, useEffect, useState } from 'react';
import {
    HippotherapyPageContentModel,
    HippotherapyPageLocalizationBlock,
    HippotherapyPageLocalizedContent,
} from '@/types/admin/hippotherapy-page';
import { LocalizationLanguage } from '@/types/common/language';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { TranslateHippotherapySectionFormValues } from '@/pages/admin/hippotherapy-page/components/translate-section-form/TranslateHippotherapySectionForm';
import { getHippotherapyTranslationConfig, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import {
    EthicsSectionMapContext,
    GallerySectionMapContext,
    mapHippotherapySectionFormValuesToDto,
    ScientificReferencesSectionMapContext,
    SectionMapContext,
} from '@/utils/functions/mappers/admin/hippotherapy-localization/hippotherapy-localization-mappers';
import { getHippotherapySectionLocalizationApi } from '@/utils/functions/get-hippotherapy-section-localization-api/get-hippotherapy-section-localization-api';
import { HippotherapyTranslationSubBlock } from '@/pages/admin/hippotherapy-page/components/translate-section-modal/TranslateHippotherapySectionModal';

export interface UseTranslateHippotherapySectionParams {
    pageContent: HippotherapyPageContentModel | null;
    block: HippotherapyPageLocalizationBlock | null;
    subBlock?: HippotherapyTranslationSubBlock | null;
    targetResearchLocalId?: string | null;
    language: LocalizationLanguage | null;
    onSuccess: () => void | Promise<void>;
}

export const getHippotherapySectionEntityId = (
    pageContent: HippotherapyPageContentModel,
    block: HippotherapyPageLocalizationBlock,
): number | null => {
    switch (block) {
        case HippotherapyPageLocalizationBlock.Intro:
            return pageContent.introSection.id;
        case HippotherapyPageLocalizationBlock.Description:
            return pageContent.descriptionSection.id;
        case HippotherapyPageLocalizationBlock.Quote:
            return pageContent.quoteSection.id;
        case HippotherapyPageLocalizationBlock.Hippovention:
            return pageContent.hippoventionSection.id;
        case HippotherapyPageLocalizationBlock.HippoventionCenter:
            return pageContent.hippoventionCenterSection.id;
        case HippotherapyPageLocalizationBlock.Advantages:
            return pageContent.advantagesSection.id;
        case HippotherapyPageLocalizationBlock.Analysis:
            return pageContent.analysisSection.id;
        case HippotherapyPageLocalizationBlock.AnotherQuote:
            return pageContent.anotherQuoteSection.id;
        case HippotherapyPageLocalizationBlock.Participants:
            return pageContent.participantsSection.id;
        case HippotherapyPageLocalizationBlock.Ethics:
            return pageContent.ethicsSection.id;
        case HippotherapyPageLocalizationBlock.ScientificReferences:
            return pageContent.scientificReferencesSection.id;
        default:
            return null;
    }
};

export const createSectionMapContext = (
    content: HippotherapyPageContentModel,
    block: HippotherapyPageLocalizationBlock,
    languageId: number,
    subBlock?: HippotherapyTranslationSubBlock | null,
    targetResearchLocalId?: string | null,
):
    | SectionMapContext
    | GallerySectionMapContext
    | EthicsSectionMapContext
    | ScientificReferencesSectionMapContext
    | null => {
    const entityId = getHippotherapySectionEntityId(content, block);
    if (entityId == null || entityId <= 0) return null;

    const baseContext: SectionMapContext = { entityId, languageId };

    switch (block) {
        case HippotherapyPageLocalizationBlock.Advantages:
            return {
                ...baseContext,
                cardIds: content.advantagesSection.cards.map((c) => c.id),
            };
        case HippotherapyPageLocalizationBlock.Participants:
            return {
                ...baseContext,
                cardIds: content.participantsSection.cards.map((c) => c.id),
            };
        case HippotherapyPageLocalizationBlock.Ethics:
            return {
                ...baseContext,
                principleIds: content.ethicsSection.principles.map((p) => p.id),
            };
        case HippotherapyPageLocalizationBlock.ScientificReferences: {
            const existingSectionLocalization = content.localizations?.find(
                (loc) => loc.languageId === languageId || loc.language?.id === languageId,
            );

            return {
                ...baseContext,
                subBlock,
                targetResearchLocalId,
                existingSectionLocalization: existingSectionLocalization?.scientificReferencesSection ?? null,
                scientificReferences: content.scientificReferencesSection.scientificReferences,
            };
        }
        default:
            return baseContext;
    }
};

const isSectionLocalizationExist = (
    pageContent: HippotherapyPageContentModel,
    block: HippotherapyPageLocalizationBlock,
    languageId: number,
): boolean => {
    const existingLocalization = pageContent.localizations?.find(
        (loc) => loc.languageId === languageId || loc.language?.id === languageId,
    );

    if (block === HippotherapyPageLocalizationBlock.ScientificReferences) {
        return Boolean(existingLocalization?.scientificReferencesSection);
    }

    const sectionConfig = getHippotherapyTranslationConfig(block);
    const sectionKey = sectionConfig?.sectionKey as keyof HippotherapyPageLocalizedContent | undefined;

    return Boolean(sectionKey && existingLocalization?.[sectionKey]);
};

export const useTranslateHippotherapySection = ({
    pageContent,
    block,
    language,
    subBlock,
    targetResearchLocalId,
    onSuccess,
}: UseTranslateHippotherapySectionParams) => {
    const client = useAdminClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const clearError = useCallback(() => {
        setError('');
    }, []);

    useEffect(() => {
        setError('');
    }, [block, subBlock, targetResearchLocalId, language?.id]);

    const translateHippotherapySection = async (data: TranslateHippotherapySectionFormValues) => {
        if (!pageContent || block == null || !language) {
            setError(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
            return;
        }

        const mapContext = createSectionMapContext(pageContent, block, language.id, subBlock, targetResearchLocalId);
        const apiService = getHippotherapySectionLocalizationApi(block);

        if (!mapContext || !apiService) {
            setError(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
            return;
        }

        const isUpdate = isSectionLocalizationExist(pageContent, block, language.id);
        const dto = mapHippotherapySectionFormValuesToDto(block, data, mapContext, isUpdate);
        if (!dto) {
            setError(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            if (isUpdate) {
                await apiService.update(client, mapContext.entityId, mapContext.languageId, dto);
            } else {
                await apiService.create(client, dto);
            }

            await onSuccess();
        } catch {
            setError(HIPPOTHERAPY_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        translateHippotherapySection,
        isSubmitting,
        error,
        clearError,
    };
};
