import { HippotherapyProgramLocalizationDto } from '../admin/programs';
import { Image } from '../common/image';
import { HippotherapyProgramSectionDto } from '../common/program-sections';
import { LocalizationInfo, TranslationStatus } from '../common/language';

export interface PublicProgramCategoryLocalizationDto {
    entityId?: number;
    languageId?: number;
    localizationInfoDto?: LocalizationInfo;
    translationStatus?: TranslationStatus;
    name?: string;
}

export interface ProgramCategoryDto {
    id: number;
    name: string;
    localizations?: PublicProgramCategoryLocalizationDto[];
}

export interface PublishedProgramDto {
    id: number;
    slug: string;
    previewImage: Image | null;
    name: string;
    description: string;
    categories: ProgramCategoryDto[];
    localizations: HippotherapyProgramLocalizationDto[];
}

export interface ProgramsPageData {
    programsCategories: ProgramCategoryDto[];
    programsData: PublishedProgramDto[];
}

export interface DetailedProgramDto {
    id: number;
    name: string;
    description: string;
    previewImage: Image | null;
    backgroundImage: Image | null;
    location: string;
    participantsCount: string;
    meetingsCount: string;
    localizations: HippotherapyProgramLocalizationDto[];
    sections: HippotherapyProgramSectionDto[];
    slug: string;
}
