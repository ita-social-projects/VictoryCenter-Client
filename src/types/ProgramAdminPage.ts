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
