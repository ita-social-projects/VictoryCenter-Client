export interface EventCategoryDto {
    id: number;
    name: string;
    createdAt?: string;
    relatedEventNewsCount: number;
    localizations?: EventCategoryLocalizationDto[];
}

export interface EventCategoryCreate {
    name: string;
}

export interface EventCategoryUpdate {
    id: number;
    name: string;
}

export interface EventCategoryLocalizationDto {
    entityId: number;
    language: {
        id: number;
        code: string;
    };
    name: string;
    translationStatus: number;
}
