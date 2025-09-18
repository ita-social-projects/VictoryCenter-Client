export type DragPreviewModel<T> = {
    visible: boolean;
    x: number;
    y: number;
    item: T | null;
};

export interface PaginationResult<T> {
    items: T[];
    totalItemsCount: number;
}

export type ModalState = {
    add: boolean;
    confirmPublish: boolean;
    confirmClose: boolean;
};

export enum VisibilityStatus {
    Draft,
    Published,
}

export enum ModalMode {
    Add,
    Edit,
}

export enum PendingAction {
    Publish,
    Draft,
}

export type StatusFilter = 'Усі' | 'Опубліковано' | 'Чернетка';
