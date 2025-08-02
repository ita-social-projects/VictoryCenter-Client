export type DragPreviewModel<T> = {
    visible: boolean;
    x: number;
    y: number;
    member: T | null;
};

export enum VisibilityStatus {
    Draft,
    Published,
}

export interface PaginationResult<T> {
    items: T[];
    totalItemsCount: number;
}

export type ModalState = {
    add: boolean;
    confirmPublish: boolean;
    confirmClose: boolean;
};

export type StatusFilter = 'Усі' | 'Опубліковано' | 'Чернетка';

export const mapStatusFilterToStatus = (filter: StatusFilter): VisibilityStatus | null => {
    switch (filter) {
        case 'Опубліковано':
            return VisibilityStatus.Published;
        case 'Чернетка':
            return VisibilityStatus.Draft;
        case 'Усі':
        default:
            return null;
    }
};
