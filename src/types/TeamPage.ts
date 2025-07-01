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
