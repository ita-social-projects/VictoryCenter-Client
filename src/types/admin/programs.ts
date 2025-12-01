import { VisibilityStatus } from './common';
import { Image, ImageValues } from '../common/image';

export interface ProgramCategory {
    id: number;
    name: string;
    programsCount: number;
}

export interface Program {
    id: number;
    name: string;
    description: string;
    categories: ProgramCategory[];
    status: VisibilityStatus;
    previewImage: Image | ImageValues | null;
    backgroundImage: Image | ImageValues | null;
    location: string;
    participantsCount: string;
    meetingCount: string;
}

export interface ProgramSearchItemData {
    id: number;
    name: string;
    categories: string[];
}

export interface ProgramCreateUpdate {
    id: number | null;
    name: string;
    description: string;
    categoryIds: number[];
    status: VisibilityStatus;
    previewImage: ImageValues | null;
    previewImageId: number | null;
    backgroundImage: ImageValues | null;
    backgroundImageId: number | null;
    location: string;
    participantsCount: string;
    meetingCount: string;
}

export interface ProgramCategoryCreateUpdate {
    id: number | null;
    name: string;
}
