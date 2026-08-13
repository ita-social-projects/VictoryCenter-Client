import { VisibilityStatus } from './common';
import { Image, ImageValues } from '../common/image';
import {
    HippotherapyProgramSectionDto,
    CreateHippotherapyProgramSectionDto,
    CreateHippotherapyProgramSectionLocalizationDto,
} from '../common/program-sections';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
    TranslationStatusInfo,
} from '../common/language';

export interface ProgramCategory {
    id: number;
    name: string;
    programsCount: number;
    localizations?: ProgramCategoryLocalization[];
    translationStatuses?: TranslationStatusInfo[];
}

export interface ProgramCategoryLocalization extends EntityLocalization {
    name: string;
}

export interface HippotherapyProgramDto
    extends HippotherapyProgramLocalizableFields,
        EntityWithDtoLocalizations<HippotherapyProgramLocalizationDto> {
    id: number;
    name: string;
    description: string;
    categories: ProgramCategory[];
    status: VisibilityStatus;
    previewImage: Image | ImageValues | null;
    backgroundImage: Image | ImageValues | null;
    location: string;
    participantsCount: string;
    meetingsCount: string;
    sections: HippotherapyProgramSectionDto[];
    slug: string;
}
export interface HippotherapyProgramLocalizableFields {
    name: string;
    description: string;
    location: string;
    participantsCount: string;
    meetingsCount: string;
}

export interface HippotherapyProgram
    extends HippotherapyProgramLocalizableFields,
        EntityWithLocalizations<HippotherapyProgramLocalization> {
    id: number;
    name: string;
    description: string;
    categories: ProgramCategory[];
    status: VisibilityStatus;
    previewImage: Image | ImageValues | null;
    backgroundImage: Image | ImageValues | null;
    location: string;
    participantsCount: string;
    meetingsCount: string;
    sections: HippotherapyProgramSectionDto[];
    slug: string;
}
export interface HippotherapyProgramLocalization extends EntityLocalization, HippotherapyProgramLocalizableFields {}

export interface HippotherapyProgramLocalizationDto
    extends EntityLocalizationDto,
        HippotherapyProgramLocalizableFields {
    entityId: number;
}

export interface ProgramSearchItemData {
    id: number;
    name: string;
    categories: string[];
}

export interface CreateHippotherapyProgramDto {
    name: string;
    description?: string | null;
    status: VisibilityStatus;
    location?: string | null;
    participantsCount?: string | null;
    meetingsCount?: string | null;
    previewImage?: Image | ImageValues | null;
    previewImageId?: number | null;
    backgroundImage?: Image | ImageValues | null;
    backgroundImageId?: number | null;
    categoryIds: number[];
    sections: CreateHippotherapyProgramSectionDto[];
}

export interface CreateHippotherapyProgramLocalizationDto extends HippotherapyProgramLocalizableFields {
    entityId: number;
    languageId: number;
    sections: CreateHippotherapyProgramSectionLocalizationDto[];
}

export interface UpdateHippotherapyProgramDto extends CreateHippotherapyProgramDto {
    id: number;
}

export interface ProgramCategoryCreateUpdate {
    id: number | null;
    name: string;
}

export enum SectionCancelActionType {
    RemoveSection,
    RevertSection,
    RevertAfterReplace,
    DiscardNewSection,
}
