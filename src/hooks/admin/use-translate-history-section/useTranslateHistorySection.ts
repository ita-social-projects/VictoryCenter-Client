import { useState } from 'react';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { HistoryLocalizationsApi } from '@/services/api/admin/history/history-localizations-api';
import {
    CreateHistorySectionLocalizationDto,
    HistorySectionContentDto,
    HistorySectionDto,
} from '@/types/common/history-sections';
import { LocalizationLanguage } from '@/types/common/language';
import { ContentType } from '@/types/common/section-contents';
import { HISTORY_TEXT } from '@/const/admin/history';

export interface TranslateHistorySectionFormValues {
    title: string;
    description: string;
}

interface UseTranslateHistorySectionParams {
    sections: HistorySectionDto[];
    language: LocalizationLanguage | null;
    onSuccess: (updatedSections: HistorySectionDto[]) => void;
}

const getContentByType = (
    contents: HistorySectionContentDto[],
    type: ContentType,
): HistorySectionContentDto | undefined => contents.find((c) => c.contentType === type);

const normaliseForSave = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const useTranslateHistorySection = ({ sections, language, onSuccess }: UseTranslateHistorySectionParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const client = useAdminClient();

    const translateSections = async (
        dataMap: { sectionId: number; data: TranslateHistorySectionFormValues }[],
    ): Promise<void> => {
        if (!sections.length || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            const payloads: CreateHistorySectionLocalizationDto[] = [];
            const updatedSections = [...sections];

            for (const { sectionId, data } of dataMap) {
                const sectionIndex = sections.findIndex((s) => s.id === sectionId);
                if (sectionIndex === -1) continue;

                const section = sections[sectionIndex];
                const titleContent = getContentByType(section.contents, ContentType.Title);
                const descriptionContent = getContentByType(section.contents, ContentType.Description);

                const normalisedTitle = normaliseForSave(data.title);
                const normalisedDescription = normaliseForSave(data.description);

                const contentDtos = [];

                if (titleContent?.id && normalisedTitle) {
                    contentDtos.push({
                        entityId: titleContent.id,
                        languageId: language.id,
                        title: normalisedTitle,
                        description: null,
                    });
                }

                if (descriptionContent?.id && normalisedDescription) {
                    contentDtos.push({
                        entityId: descriptionContent.id,
                        languageId: language.id,
                        title: null,
                        description: normalisedDescription,
                    });
                }

                if (contentDtos.length > 0) {
                    const payload = {
                        entityId: section.id!,
                        languageId: language.id,
                        contents: contentDtos,
                    };

                    payloads.push(payload);
                }

                updatedSections[sectionIndex] = {
                    ...section,
                    contents: section.contents.map((content) => {
                        if (
                            content.contentType === ContentType.Title &&
                            content.id === titleContent?.id &&
                            normalisedTitle
                        ) {
                            return {
                                ...content,
                                localizations: [
                                    ...(content.localizations ?? []),
                                    {
                                        entityId: content.id!,
                                        languageId: language.id,
                                        localizationInfoDto: {
                                            id: language.id,
                                            code: language.code,
                                            name: language.name,
                                        },
                                        translationStatus: 0,
                                        title: normalisedTitle,
                                        description: null,
                                    },
                                ],
                            };
                        }
                        if (
                            content.contentType === ContentType.Description &&
                            content.id === descriptionContent?.id &&
                            normalisedDescription
                        ) {
                            return {
                                ...content,
                                localizations: [
                                    ...(content.localizations ?? []),
                                    {
                                        entityId: content.id!,
                                        languageId: language.id,
                                        localizationInfoDto: {
                                            id: language.id,
                                            code: language.code,
                                            name: language.name,
                                        },
                                        translationStatus: 0,
                                        title: null,
                                        description: normalisedDescription,
                                    },
                                ],
                            };
                        }
                        return content;
                    }),
                };
            }

            const updatePayloads: { sectionId: number; payload: CreateHistorySectionLocalizationDto }[] = [];
            const createPayloads: CreateHistorySectionLocalizationDto[] = [];

            for (const payload of payloads) {
                const section = sections.find((s) => s.id === payload.entityId);
                const hasExistingLocalization = section?.contents.some((c) =>
                    c.localizations?.some((l) => l.localizationInfoDto.id === language.id),
                );

                if (hasExistingLocalization) {
                    updatePayloads.push({ sectionId: payload.entityId, payload });
                } else {
                    createPayloads.push(payload);
                }
            }

            await Promise.all(
                updatePayloads.map(({ sectionId, payload }) =>
                    HistoryLocalizationsApi.update(client, sectionId, language.id, payload),
                ),
            );

            if (createPayloads.length > 0) {
                await HistoryLocalizationsApi.create(client, createPayloads);
            }

            onSuccess(updatedSections);
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

    return { translateSections, isSubmitting, error, clearError };
};
