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
