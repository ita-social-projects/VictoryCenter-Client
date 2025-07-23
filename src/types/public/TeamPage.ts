import { TeamCategory } from '../admin/TeamMembers';
import { Image } from '../Image';

export interface MemberCard {
    id: number;
    name: string;
    role: string;
    photo: string;
}

export type Member = {
    id: number;
    img: Image | null;
    fullName: string;
    description: string;
    status: string;
    category: TeamCategory;
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
}

export interface TeamPageData {
    teamData: TeamItem[];
}

export interface TeamMemberProps {
    member: MemberCard;
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
