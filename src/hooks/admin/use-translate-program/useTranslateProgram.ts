import { useState } from 'react';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { TranslateProgramFormValues } from '@/pages/admin/programs/components/translate-program-form/TranslateProgramForm';
import { ProgramLocalizationsApi } from '@/services/api/admin/programs/program-localizations/program-localizations-api';
import { HippotherapyProgram, HippotherapyProgramLocalization } from '@/types/admin/programs';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { ContentType } from '@/types/common/programs';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';

interface UseTranslateProgramParams {
    program: HippotherapyProgram | null;
    language: LocalizationLanguage;
    onSuccess: (updatedProgram: HippotherapyProgram) => void;
    mode: ModalMode;
}

export const useTranslateProgram = ({ program, language, onSuccess, mode }: UseTranslateProgramParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateProgram = async (data: TranslateProgramFormValues) => {
        if (!program) return;

        try {
            setIsSubmitting(true);
            setError('');

            const sanitizedSections = (data.sections || []).map((section) => {
                const sourceSection = (section as any).__sourceSection;

                const filteredContents = (section.contents || []).filter((content) => {
                    const sourceContent = sourceSection?.contents?.find(
                        (c: { id?: number }) => c.id === content.entityId,
                    );

                    if (!sourceContent) return true;

                    if (
                        sourceContent.contentType === ContentType.Image ||
                        sourceContent.image ||
                        sourceContent.imageId
                    ) {
                        return false;
                    }

                    const hasText = (v: any) => typeof v === 'string' && v.trim().length > 0;

                    const hasTitle = hasText(sourceContent.title);
                    const hasDescription = hasText(sourceContent.description);
                    const hasAuthor = hasText(sourceContent.author);
                    const hasFaqQuestion = !!(sourceContent.faqQuestionId || sourceContent.faqQuestion);

                    if (!hasTitle && !hasDescription && !hasAuthor && !hasFaqQuestion) {
                        return false;
                    }

                    const nonEmptyCount = [hasTitle, hasDescription, hasAuthor, hasFaqQuestion].filter(Boolean).length;
                    if (nonEmptyCount > 1) {
                        switch (sourceContent.contentType) {
                            case ContentType.Title:
                                if (hasDescription || hasAuthor || hasFaqQuestion) return false;
                                break;
                            case ContentType.Description:
                                if (hasTitle || hasAuthor || hasFaqQuestion) return false;
                                break;
                            case ContentType.Author:
                                if (hasTitle || hasDescription || hasFaqQuestion) return false;
                                break;
                            case ContentType.FaqQuestion:
                                if (hasTitle || hasDescription || hasAuthor) return false;
                                break;
                            default:
                                return false;
                        }
                    }

                    return true;
                });

                return {
                    entityId: section.entityId,
                    contents: filteredContents.map((content) => ({
                        entityId: content.entityId,
                        languageId: language.id,
                        title: content.title ?? null,
                        description: content.description ?? null,
                        author: content.author ?? null,
                        question: content.question ?? null,
                        answer: content.answer ?? null,
                    })),
                };
            });

            const payload = {
                entityId: program.id,
                languageId: language.id,
                name: data.name,
                description: data.description,
                location: data.location,
                participantsCount: data.participantsCount,
                meetingsCount: data.meetingCount,
                sections: sanitizedSections,
            };

            const localizationDto = isEditMode
                ? await ProgramLocalizationsApi.update(client, program.id, language.id, {
                      name: payload.name,
                      description: payload.description,
                      location: payload.location,
                      participantsCount: payload.participantsCount,
                      meetingsCount: payload.meetingsCount,
                      sections: payload.sections,
                  })
                : await ProgramLocalizationsApi.create(client, payload);

            const localization = mapLocalizationDtoToModel<typeof localizationDto, HippotherapyProgramLocalization>(
                localizationDto,
            );

            let updated: HippotherapyProgram;
            if (isEditMode) {
                updated = {
                    ...program,
                    localizations: program.localizations?.map((l) =>
                        l.language.id === language.id ? localization : l,
                    ) || [localization],
                };
            } else {
                updated = {
                    ...program,
                    localizations: [...(program.localizations || []), localization],
                };
            }

            onSuccess(updated);
        } catch (err) {
            const errorMessage = isEditMode
                ? PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM
                : PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return { translateProgram, isSubmitting, error, clearError };
};
