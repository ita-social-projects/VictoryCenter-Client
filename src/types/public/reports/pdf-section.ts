import { LocalizationInfo } from '@/types/common/language';

export interface PublicPdfSectionLocalizationDto {
    language: LocalizationInfo;
    title: string;
    description: string;
}

export interface PublicPdfSectionDto {
    title: string;
    description: string;
    localizations: PublicPdfSectionLocalizationDto[];
}
