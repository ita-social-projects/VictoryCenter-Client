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
    onSuccess: (updatedCategory: EventCategoryDto) => void;
}

export const useTranslateEventCategory = ({ category, language, onSuccess }: UseTranslateEventCategoryParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const client = useAdminClient();

    const translateEventCategory = async (data: TranslateEventCategoryFormValues) => {
        if (!category || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            const createdLocalizationDto = await EventCategoryLocalizationsApi.create(client, {
                entityId: category.id,
                languageId: language.id,
                name: data.name,
            });

            const createdCategory: EventCategoryDto = {
                ...category,
                localizations: [...(category.localizations || []), createdLocalizationDto],
            };

            onSuccess(createdCategory);
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
