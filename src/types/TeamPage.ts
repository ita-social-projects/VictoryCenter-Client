export interface Member {
    id: number;
    name: string;
    role: string;
    photo: string;
}

export interface TeamItem {
    title: string;
    description: string;
    members: Member[];
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
    member: Member;
}

export interface TeamMemberDto {
    id: number;
    fullName: string;
    categoryId: number;
    priority: number;
    status: number;
    description: string;
    photo: string;
    email: string;
}

export type TeamCategory = 'Основна команда' | 'Наглядова рада' | 'Радники';
