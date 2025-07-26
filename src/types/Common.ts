export type VisibilityStatus = 'Draft' | 'Published';

export interface PaginationResult<T> {
    items: T[];
    totalItemsCount: number;
}

/* eslint-disable no-unused-vars */
export type ModalState = {
    add: boolean;
    confirmPublish: boolean;
    confirmClose: boolean;
};

export type StatusFilter = 'Усі' | 'Опубліковано' | 'Чернетка';

export enum Status {
    Draft,
    Published,
}

export const mapStatusFilterToStatus = (filter: StatusFilter): Status | null => {
    switch (filter) {
        case 'Опубліковано':
            return Status.Published;
        case 'Чернетка':
            return Status.Draft;
        case 'Усі':
        default:
            return null;
    }
};
