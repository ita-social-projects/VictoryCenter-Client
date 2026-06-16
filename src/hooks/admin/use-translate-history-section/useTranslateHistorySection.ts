import { useState } from 'react';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { HistoryLocalizationsApi } from '@/services/api/admin/history/history-localizations-api';
import { HistorySectionContentDto, HistorySectionDto } from '@/types/common/history-sections';
import { LocalizationLanguage } from '@/types/common/language';
import { ContentType } from '@/types/common/section-contents';
import { HISTORY_TEXT } from '@/const/admin/history';

export interface TranslateHistorySectionFormValues {
    title: string;
    description: string;
}

interface UseTranslateHistorySectionParams {
    section: HistorySectionDto | null;
    language: LocalizationLanguage | null;
    onSuccess: (updatedSection: HistorySectionDto) => void;
}

const getContentByType = (
    contents: HistorySectionContentDto[],
    type: ContentType,
): HistorySectionContentDto | undefined => contents.find((c) => c.contentType === type);

export const useTranslateHistorySection = ({ section, language, onSuccess }: UseTranslateHistorySectionParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const client = useAdminClient();

    const translateSection = async (data: TranslateHistorySectionFormValues): Promise<void> => {
        if (!section || !language || section.id === undefined) return;

        try {
            setIsSubmitting(true);
            setError('');

            const titleContent = getContentByType(section.contents, ContentType.Title);
            const descriptionContent = getContentByType(section.contents, ContentType.Description);

            const contentDtos = [];

            if (titleContent?.id && data.title.trim()) {
                contentDtos.push({
                    entityId: titleContent.id,
                    languageId: language.id,
                    title: data.title.trim(),
                    description: null,
                });
            }

            if (descriptionContent?.id && data.description.trim()) {
                contentDtos.push({
                    entityId: descriptionContent.id,
                    languageId: language.id,
                    title: null,
                    description: data.description.trim(),
                });
            }

            if (contentDtos.length > 0) {
                const payload = {
                    entityId: section.id,
                    languageId: language.id,
                    contents: contentDtos,
                };

                const hasExistingLocalization = section.contents.some((c) =>
                    c.localizations?.some((l) => l.localizationInfoDto.id === language.id),
                );

                if (hasExistingLocalization) {
                    await HistoryLocalizationsApi.update(client, section.id, language.id, payload);
                } else {
                    await HistoryLocalizationsApi.create(client, payload);
                }
            }

            const updatedSection: HistorySectionDto = {
                ...section,
                contents: section.contents.map((content) => {
                    if (
                        content.contentType === ContentType.Title &&
                        content.id === titleContent?.id &&
                        data.title.trim()
                    ) {
                        return {
                            ...content,
                            localizations: [
                                ...(content.localizations ?? []),
                                {
                                    entityId: content.id!,
                                    languageId: language.id,
                                    localizationInfoDto: { id: language.id, code: language.code, name: language.name },
                                    translationStatus: 0,
                                    title: data.title.trim(),
                                    description: null,
                                },
                            ],
                        };
                    }
                    if (
                        content.contentType === ContentType.Description &&
                        content.id === descriptionContent?.id &&
                        data.description.trim()
                    ) {
                        return {
                            ...content,
                            localizations: [
                                ...(content.localizations ?? []),
                                {
                                    entityId: content.id!,
                                    languageId: language.id,
                                    localizationInfoDto: { id: language.id, code: language.code, name: language.name },
                                    translationStatus: 0,
                                    title: null,
                                    description: data.description.trim(),
                                },
                            ],
                        };
                    }
                    return content;
                }),
            };

            onSuccess(updatedSection);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.detail || err.response?.data?.title || HISTORY_TEXT.MESSAGE.TRANSLATE_ERROR;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return { translateSection, isSubmitting, error, clearError };
};
