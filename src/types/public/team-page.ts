import { TeamMemberLocalizationDto } from '../admin/team-members';
import { Image } from '../common/image';

export interface MemberCard {
    id: number;
    name: string;
    role: string;
    photo: string | null;
    localizations?: TeamMemberLocalizationDto[];
}

export type Member = {
    id: number;
    img: Image | null;
    fullName: string;
    description: string;
    status: string;
};

export interface TeamItem {
    title: string;
    description: string;
    members: MemberCard[];
}

export interface PublicCategoryWithTeamMembersDto {
    id: number;
    categoryName: string;
    description: string | null;
    teamMembers: PublicTeamMemberDto[];
}

export interface PublicTeamMemberDto {
    id: number;
    fullName: string;
    description: string | null;
    image: Image | null;
    localizations: TeamMemberLocalizationDto[];
}

export interface TeamPageData {
    teamData: TeamItem[];
}

export interface TeamMemberDto {
    id: number;
    fullName: string;
    categoryId: number;
    priority: number;
    status: number;
    description: string;
    image: Image | null;
    email: string;
}
