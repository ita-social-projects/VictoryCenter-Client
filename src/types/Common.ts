/* eslint-disable no-unused-vars */
import { VisibilityStatus } from './admin/Common';

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
