import { VisibilityStatus } from './Common';
import { Image } from '../Image';

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
    img: Image | null;
}

export interface ProgramCreateUpdate {
    id: number | null;
    name: string;
    description: string;
    categoryIds: number[];
    status: VisibilityStatus;
    img: Image | null;
}

export interface ProgramCategoryCreateUpdate {
    id: number | null;
    name: string;
}
