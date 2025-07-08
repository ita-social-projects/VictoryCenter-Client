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
    status: string;
    img: string;
}
