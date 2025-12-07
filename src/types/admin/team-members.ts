import { Image, ImageValues } from '../common/image';
import { VisibilityStatus } from './common';

export type TeamMember = {
    id: number;
    image: Image | ImageValues | null;
    fullName: string;
    description: string;
    status: VisibilityStatus;
    categoryId: number;
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
