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
