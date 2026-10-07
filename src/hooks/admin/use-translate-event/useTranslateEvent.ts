import { useState } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ModalMode } from '@/types/admin/common';
import { EventItemDto, EventLocalization } from '@/types/admin/events';
import { LocalizationLanguage } from '@/types/common/language';
import { EventLocalizationsApi } from '@/services/api/admin/events/event-localizations/event-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { TranslateEventFormValues } from '@/pages/admin/events/translate-event-form/TranslateEventForm';

export interface UseTranslateEventParams {
    event: EventItemDto | null;
    language: LocalizationLanguage | null;
    onSuccess: (updatedEvent: EventItemDto) => void;
    mode?: ModalMode;
}

export const useTranslateEvent = ({ event, language, onSuccess, mode = ModalMode.Add }: UseTranslateEventParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateEvent = async (data: TranslateEventFormValues) => {
        if (!event || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            const normalizedAdditionalDescription = data.additionalDescription?.trim() || null;

            if (isEditMode) {
                const updatedLocalizationDto = await EventLocalizationsApi.update(client, event.id, language.id, {
                    title: data.title.trim(),
                    description: data.description.trim(),
                    additionalDescription: normalizedAdditionalDescription,
                });

                const updatedLocalization = mapLocalizationDtoToModel<typeof updatedLocalizationDto, EventLocalization>(
                    updatedLocalizationDto,
                );

                const finalLocalization: EventLocalization = {
                    ...updatedLocalization,
                    language: updatedLocalization.language || { id: language.id, code: language.code },
                };

                const updatedEvent: EventItemDto = {
                    ...event,
                    localizations: (event.localizations || []).map((loc) =>
                        (loc.language?.id ?? (loc as unknown as { languageId?: number }).languageId) === language.id
                            ? finalLocalization
                            : loc,
                    ),
                };

                onSuccess(updatedEvent);
            } else {
                const createdLocalizationDto = await EventLocalizationsApi.create(client, {
                    entityId: event.id,
                    languageId: language.id,
                    title: data.title.trim(),
                    description: data.description.trim(),
                    additionalDescription: normalizedAdditionalDescription,
                });

                const createdLocalization = mapLocalizationDtoToModel<typeof createdLocalizationDto, EventLocalization>(
                    createdLocalizationDto,
                );

                const finalLocalization: EventLocalization = {
                    ...createdLocalization,
                    language: createdLocalization.language || { id: language.id, code: language.code },
                };

                const updatedEvent: EventItemDto = {
                    ...event,
                    localizations: [...(event.localizations || []), finalLocalization],
                };

                onSuccess(updatedEvent);
            }
        } catch (err) {
            setError(COMMON_TEXT_ADMIN.MESSAGE.ERROR_TRY_AGAIN);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateEvent,
        isSubmitting,
        error,
        clearError,
    };
};
