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
    image: Image | ImageValues | null;
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
    image: ImageValues | null;
    imageId: number | null;
}

export interface ProgramCategoryCreateUpdate {
    id: number | null;
    name: string;
}
