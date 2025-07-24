export type VisibilityStatus = 'Draft' | 'Published';

export interface PaginationResult<T> {
    items: T[];
    totalItemsCount: number;
}
