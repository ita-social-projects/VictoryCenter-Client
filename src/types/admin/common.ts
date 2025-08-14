export type DragPreviewModel<T> = {
    visible: boolean;
    x: number;
    y: number;
    item: T | null;
};

export enum VisibilityStatus {
    Draft,
    Published,
}

export interface PaginationResult<T> {
    items: T[];
    totalItemsCount: number;
}
