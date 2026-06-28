import { useState } from 'react';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { PdfSection } from '@/types/admin/pdf-section';
import { LocalizationLanguage } from '@/types/common/language';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';
import { PdfSectionLocalizationsApi } from '@/services/api/admin/reports/pdf-section/pdf-section-localization/pdf-section-localizations-api';

interface UseTranslatePdfSectionParams {
    pdfSection: PdfSection | null;
    language: LocalizationLanguage | null | undefined;
    onSuccess: (updatedSection: PdfSection) => void;
    mode: ModalMode;
}

interface TranslatePdfSectionFormData {
    title: string;
    description: string;
}

export const useTranslatePdfSection = ({ pdfSection, language, onSuccess, mode }: UseTranslatePdfSectionParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translatePdfSection = async (data: TranslatePdfSectionFormData) => {
        if (!pdfSection || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await PdfSectionLocalizationsApi.update(client, language.id, {
                    title: data.title,
                    description: data.description,
                });

                const updatedSection: PdfSection = {
                    ...pdfSection,
                    localizations: pdfSection.localizations.map((loc) =>
                        loc.languageId === language.id ? updatedLocalizationDto : loc,
                    ),
                };
                onSuccess(updatedSection);
            } else {
                const createdLocalizationDto = await PdfSectionLocalizationsApi.create(client, {
                    languageId: language.id,
                    title: data.title,
                    description: data.description,
                });

                const updatedSection: PdfSection = {
                    ...pdfSection,
                    localizations: [...pdfSection.localizations, createdLocalizationDto],
                };
                onSuccess(updatedSection);
            }
        } catch (err) {
            const errorMessage = isEditMode
                ? PDF_FILES_SECTION_TEXT.MESSAGE.FAIL_TO_UPDATE_TRANSLATION
                : PDF_FILES_SECTION_TEXT.MESSAGE.FAIL_TO_CREATE_TRANSLATION;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translatePdfSection,
        isSubmitting,
        error,
        clearError,
    };
};
