import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';
import { TeamMemberLocalization } from './localization/team-members';

export type TeamMember = {
    id: number;
    image: Image | ImageValues | null;
    fullName: string;
    description: string;
    status: VisibilityStatus;
    categoryId: number;
    localizations: TeamMemberLocalization[];
};

export interface TeamMemberDto {
    id: number;
    fullName: string;
    categoryId: number;
    priority: number;
    status: number;
    description: string;
    image: Image;
    email: string;
}

export interface TeamMemberCreateUpdateRequest {
    id: number | null;
    fullName: string;
    description: string;
    image: Image | ImageValues | null;
    categoryId: number | null;
    status: VisibilityStatus;
    imageId: number | null;
}
