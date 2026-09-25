import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { EventsPageModals } from './EventsPageModals';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';
import { DeleteEventCategoryModal } from '../delete-event-category-modal/DeleteEventCategoryModal';
import { EventModal } from '../event-modal/EventModal';
import { TranslateEventCategoryModal } from '../translate-event-category-modal/TranslateEventCategoryModal';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ModalMode } from '@/types/admin/common';
import { EventItemDto } from '@/types/admin/events';
import { LocalizationLanguage } from '@/types/common/language';

jest.mock('../event-category-modal/EventCategoryModal', () => ({
    EventCategoryModal: jest.fn(() => <div data-testid="event-category-modal" />),
}));

jest.mock('../delete-event-category-modal/DeleteEventCategoryModal', () => ({
    DeleteEventCategoryModal: jest.fn(() => <div data-testid="delete-event-category-modal" />),
}));

jest.mock('../event-modal/EventModal', () => ({
    EventModal: jest.fn(() => <div data-testid="event-modal" />),
}));

jest.mock('../translate-event-category-modal/TranslateEventCategoryModal', () => ({
    TranslateEventCategoryModal: jest.fn(() => <div data-testid="translate-event-category-modal" />),
}));

const mockedEventCategoryModal = EventCategoryModal as jest.Mock;
const mockedDeleteEventCategoryModal = DeleteEventCategoryModal as jest.Mock;
const mockedEventModal = EventModal as jest.Mock;
const mockedTranslateEventCategoryModal = TranslateEventCategoryModal as jest.Mock;

describe('EventsPageModals', () => {
    const categories: EventCategoryDto[] = [
        {
            id: 1,
            name: 'Category 1',
            relatedEventNewsCount: 0,
        },
        {
            id: 2,
            name: 'Category 2',
            relatedEventNewsCount: 0,
        },
    ];

    const currentCategory: EventCategoryDto | null = {
        id: 1,
        name: 'Category 1',
        relatedEventNewsCount: 0,
    };

    const translationLanguages: LocalizationLanguage[] = [{ id: 1, code: 'en', name: 'Англійська' }];

    const closeAddCategoryModal = jest.fn();
    const closeEditCategoryModal = jest.fn();
    const closeAddItemModal = jest.fn();
    const closeDeleteCategoryModal = jest.fn();
    const closeTranslateCategoryModal = jest.fn();
    const onAddCategory = jest.fn();
    const onUpdateCategory = jest.fn();
    const onDeleteCategory = jest.fn();

    const createModalsStateControl = (
        isAddCategoryModalOpen = false,
        isEditCategoryModalOpen = false,
        isAddModalOpen = false,
        isDeleteCategoryModalOpen = false,
        isCategoryToTranslate = false,
    ): UseModalsStateResult<EventItemDto> =>
        ({
            modalState: {
                isAddCategoryModalOpen,
                isEditCategoryModalOpen,
                isAddModalOpen,
                isDeleteCategoryModalOpen,
                isCategoryToTranslate,
            },
            closeModalActions: {
                closeAddCategoryModal,
                closeEditCategoryModal,
                closeAddItemModal,
                closeDeleteCategoryModal,
                closeTranslateCategoryModal,
            },
        }) as unknown as UseModalsStateResult<EventItemDto>;

    const getModalPropsByMode = (mode: ModalMode) =>
        mockedEventCategoryModal.mock.calls.map(([props]) => props).find((props) => props.mode === mode);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders add category modal', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(true)}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                translationLanguages={translationLanguages}
            />,
        );

        const addModalProps = getModalPropsByMode(ModalMode.Add);

        expect(addModalProps).toEqual(
            expect.objectContaining({
                mode: ModalMode.Add,
                isOpen: true,
                onClose: closeAddCategoryModal,
                categories,
                onAddCategory,
            }),
        );
    });

    it('renders edit category modal', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, true)}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                translationLanguages={translationLanguages}
            />,
        );

        const editModalProps = getModalPropsByMode(ModalMode.Edit);

        expect(editModalProps).toEqual(
            expect.objectContaining({
                mode: ModalMode.Edit,
                isOpen: true,
                onClose: closeEditCategoryModal,
                categories,
                onUpdateCategory,
            }),
        );
    });

    it('passes isOpen, onClose and onConfirm to delete category modal', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, false, false, true)}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                translationLanguages={translationLanguages}
            />,
        );

        const deleteModalProps = mockedDeleteEventCategoryModal.mock.calls[0][0];

        expect(deleteModalProps).toEqual(
            expect.objectContaining({
                isOpen: true,
                onClose: closeDeleteCategoryModal,
                onConfirm: onDeleteCategory,
            }),
        );
    });

    it('passes false as isOpen when all modals are closed', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, false, false, false, false)}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                translationLanguages={translationLanguages}
            />,
        );

        const addModalProps = getModalPropsByMode(ModalMode.Add);
        const editModalProps = getModalPropsByMode(ModalMode.Edit);
        const deleteModalProps = mockedDeleteEventCategoryModal.mock.calls[0][0];
        const eventModalProps = mockedEventModal.mock.calls[0][0];
        const translateModalProps = mockedTranslateEventCategoryModal.mock.calls[0][0];

        expect(addModalProps).toEqual(
            expect.objectContaining({
                mode: ModalMode.Add,
                isOpen: false,
            }),
        );

        expect(editModalProps).toEqual(
            expect.objectContaining({
                mode: ModalMode.Edit,
                isOpen: false,
            }),
        );

        expect(deleteModalProps).toEqual(
            expect.objectContaining({
                isOpen: false,
            }),
        );

        expect(eventModalProps).toEqual(
            expect.objectContaining({
                isOpen: false,
            }),
        );

        expect(translateModalProps).toEqual(
            expect.objectContaining({
                isOpen: false,
            }),
        );
    });

    it('renders add event modal', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, false, true)}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                translationLanguages={translationLanguages}
            />,
        );

        const eventModalProps = mockedEventModal.mock.calls[0][0];

        expect(eventModalProps).toEqual(
            expect.objectContaining({
                isOpen: true,
                onClose: closeAddItemModal,
                currentCategory,
            }),
        );
    });

    it('renders translate category modal', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, false, false, false, true)}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                translationLanguages={translationLanguages}
            />,
        );

        const translateModalProps = mockedTranslateEventCategoryModal.mock.calls[0][0];

        expect(translateModalProps).toEqual(
            expect.objectContaining({
                isOpen: true,
                categories,
                onClose: closeTranslateCategoryModal,
                translationLanguages,
            }),
        );
    });
});
