export interface EventCategoryDto {
    id: number;
    name: string;
    relatedEventNewsCount: number;
}

export interface EventCategoryCreate {
    name: string;
}

export interface EventCategoryUpdate {
    id: number;
    name: string;
}