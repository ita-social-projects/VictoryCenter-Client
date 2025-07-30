export type DragPreviewModel<T> = {
    visible: boolean;
    x: number;
    y: number;
    member: T | null;
};

export type VisibilityStatus = 'Draft' | 'Published';

export interface PaginationResult<T> {
    items: T[];
    totalItemsCount: number;
}
