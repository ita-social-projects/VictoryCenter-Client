import { TranslationStatus, LocalizationLanguage, EntityLocalizationDto } from '@/types/common/language';

export interface PdfSectionLocalizableFields {
    title: string;
    description: string;
}

export interface PdfSection extends PdfSectionLocalizableFields {
    localizations: PdfSectionLocalizationDto[];
}

export interface PdfSectionLocalizationDto extends PdfSectionLocalizableFields, EntityLocalizationDto {
    languageId: number;
    translationStatus: TranslationStatus;
}

export interface PdfSectionLocalization extends PdfSectionLocalizableFields {
    language: LocalizationLanguage;
    translationStatus: TranslationStatus;
}

export interface CreatePdfSectionLocalizationDto extends PdfSectionLocalizableFields {
    languageId: number;
}

export type UpdatePdfSectionLocalizationDto = PdfSectionLocalizableFields;

export interface PdfReportDto {
    id: number;
    name: string;
    blobName: string;
    fileSizeBytes: number;
    createdAt: string;
    priority: number;
}
