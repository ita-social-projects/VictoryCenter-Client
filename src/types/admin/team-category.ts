export interface TeamCategory {
    id: number;
    name: string;
    description: string;
    teamMembersCount: number;
}

export interface TeamCategoryCreateUpdate {
    id: number | null;
    name: string;
    description: string;
}
