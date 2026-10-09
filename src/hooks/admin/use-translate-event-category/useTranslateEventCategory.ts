import { useState } from 'react';
import { EVENT_CATEGORY_TEXT } from '@/const/admin/events';
import { EventCategoryLocalizationsApi } from '@/services/api/admin/events/event-category-localization-api/event-category-localization-api';
import { EventCategoryDto } from '@/types/admin/event-category';
import { LocalizationLanguage } from '@/types/common/language';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { TranslateEventCategoryFormValues } from '@/pages/admin/events/translate-event-category-form/TranslateEventCategoryForm';

interface UseTranslateEventCategoryParams {
    category: EventCategoryDto | null;
    language: LocalizationLanguage | null;
    hasExistingTranslation?: boolean;
    onSuccess: (updatedCategory: EventCategoryDto) => void;
}

export const useTranslateEventCategory = ({
    category,
    language,
    hasExistingTranslation,
    onSuccess,
}: UseTranslateEventCategoryParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const client = useAdminClient();

    const translateEventCategory = async (data: TranslateEventCategoryFormValues) => {
        if (!category || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            let updatedLocalizations = category.localizations || [];

            if (hasExistingTranslation) {
                const updatedLocalizationDto = await EventCategoryLocalizationsApi.update(client, {
                    entityId: category.id,
                    languageId: language.id,
                    name: data.name,
                });

                updatedLocalizations = updatedLocalizations.map((loc) =>
                    loc.entityId === category.id && loc.language.id === language.id ? updatedLocalizationDto : loc,
                );
            } else {
                const createdLocalizationDto = await EventCategoryLocalizationsApi.create(client, {
                    entityId: category.id,
                    languageId: language.id,
                    name: data.name,
                });

                updatedLocalizations = [...updatedLocalizations, createdLocalizationDto];
            }

            const updatedCategory: EventCategoryDto = {
                ...category,
                localizations: updatedLocalizations,
            };

            onSuccess(updatedCategory);
        } catch (err) {
            setError(EVENT_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateEventCategory,
        isSubmitting,
        error,
        clearError,
    };
};
