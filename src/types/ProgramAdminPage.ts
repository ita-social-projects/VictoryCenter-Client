export interface ProgramCategory {
    id: number;
    name: string;
    programsCount: number;
}

export type ProgramStatus = 'Draft' | 'Published';

export interface Program {
    id: number;
    name: string;
    description: string;
    categories: ProgramCategory[];
    status: ProgramStatus;
    img: string | null;
}

export interface ProgramCreateUpdate {
    id?: number;
    name: string;
    description: string;
    categoryIds: number[];
    status: ProgramStatus;
    img: string | null;
}

export interface ProgramCategoryCreateUpdate {
    id: number | null;
    name: string;
}