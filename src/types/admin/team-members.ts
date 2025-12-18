import { Image, ImageValues } from '../common/image';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';
import { VisibilityStatus } from './common';

export interface TeamMember extends TeamMemberLocalizableFields, EntityWithLocalizations<TeamMemberLocalization> {
    id: number;
    image: Image | ImageValues | null;
    status: VisibilityStatus;
    categoryId: number;
    email?: string;
    priority?: number;
}

export interface TeamMemberLocalization extends EntityLocalization, TeamMemberLocalizableFields {}

export interface TeamMemberLocalizableFields {
    fullName: string;
    description: string;
}

export interface TeamMemberDto
    extends TeamMemberLocalizableFields,
        EntityWithDtoLocalizations<TeamMemberLocalizationDto> {
    id: number;
    image: Image | ImageValues | null;
    status: VisibilityStatus;
    categoryId: number;
    email: string;
    priority: number;
}

export interface TeamMemberLocalizationDto extends EntityLocalizationDto, TeamMemberLocalizableFields {
    entityId: number;
}

export type CreateTeamMemberLocalizationDto = {
    entityId: number;
    languageId: number;
    fullName: string;
    description?: string | null;
};

export interface TeamMemberCreateUpdateRequest {
    id: number | null;
    fullName: string;
    description: string;
    image: Image | ImageValues | null;
    categoryId: number | null;
    status: VisibilityStatus;
    imageId: number | null;
}
