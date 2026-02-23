import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';

export interface TeamCategoryDto
    extends TeamCategoryLocalizableFields,
        EntityWithDtoLocalizations<TeamCategoryLocalizationDto> {
    id: number;
    name: string;
    description: string;
    teamMembersCount: number;
}
export interface TeamCategory extends TeamCategoryLocalizableFields, EntityWithLocalizations<TeamCategoryLocalization> {
    id: number;
    name: string;
    description: string;
    teamMembersCount: number;
}

export interface TeamCategoryCreateUpdate {
    id: number | null;
    name: string;
    description: string;
}

export interface TeamCategoryLocalizableFields {
    name: string;
    description: string;
}

export interface CreateTeamCategoryLocalizationDto {
    entityId: number;
    languageId: number;
    name: string;
    description: string;
}

export interface UpdateTeamCategoryLocalizationDto {
    name: string;
    description: string;
}

export interface TeamCategoryLocalizationDto extends EntityLocalizationDto, TeamCategoryLocalizableFields {
    entityId: number;
}

export interface TeamCategoryLocalization extends EntityLocalization, TeamCategoryLocalizableFields {}
