import { TranslationStatus } from '@/types/common/language';

export interface PdfSectionLocalizableFields {
    title: string;
    description: string;
}

export interface PdfSection extends PdfSectionLocalizableFields {
    localizations: PdfSectionLocalizationDto[];
}

export interface PdfSectionLocalizationDto extends PdfSectionLocalizableFields {
    languageId: number;
    translationStatus: TranslationStatus;
}

export interface PdfReportDto {
    id: number;
    name: string;
    blobName: string;
    fileSizeBytes: number;
    createdAt: string;
    priority: number;
}
