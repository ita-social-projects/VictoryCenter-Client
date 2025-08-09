import { Image } from '../common/image';

export type TeamMember = {
    id: number;
    img: string | null;
    fullName: string;
    description: string;
    status: string;
    category: TeamCategory;
};

export interface TeamMemberDto {
    id: number;
    fullName: string;
    category: TeamCategory;
    priority: number;
    status: number;
    description: string;
    image: Image;
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
