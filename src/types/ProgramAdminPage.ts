import { VisibilityStatus } from './Common';

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
    img: string | null;
}

export interface ProgramCreateUpdate {
    id?: number;
    name: string;
    description: string;
    categoryIds: number[];
    status: VisibilityStatus;
    img: File | string | null;
}

export interface ProgramCategoryCreateUpdate {
    id?: number;
    name: string;
}
