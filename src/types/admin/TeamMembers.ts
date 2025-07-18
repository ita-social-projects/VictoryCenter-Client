export type Member = {
    id: number;
    img: string;
    fullName: string;
    description: string;
    status: string;
    category: TeamCategory;
};

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

export type TeamCategory = {
    id: number;
    name: string;
    description: string;
};

export interface TeamCategoryDto {
    id: number;
    name: string;
    description: string;
}
