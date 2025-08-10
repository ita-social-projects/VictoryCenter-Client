import { Image, ImageValues } from '../Image';
import { VisibilityStatus } from './Common';

export type TeamMember = {
    id: number;
    image: Image | null;
    fullName: string;
    description: string;
    status: VisibilityStatus;
    categoryId: number;
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
    image: ImageValues | null;
    categoryId: number | null;
    status: VisibilityStatus;
    imageId: number | null;
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
