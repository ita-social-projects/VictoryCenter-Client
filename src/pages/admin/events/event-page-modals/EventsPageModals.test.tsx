import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EventsPageModals } from './EventsPageModals';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';
import { DeleteEventCategoryModal } from '../delete-event-category-modal/DeleteEventCategoryModal';
import { EventModal } from '../event-modal/EventModal';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ModalMode } from '@/types/admin/common';
import { EventsNews } from '@/types/admin/events-news';

jest.mock('../event-category-modal/EventCategoryModal', () => ({
    EventCategoryModal: jest.fn(() => <div data-testid="event-category-modal" />),
}));

jest.mock('../delete-event-category-modal/DeleteEventCategoryModal', () => ({
    DeleteEventCategoryModal: jest.fn(() => <div data-testid="delete-event-category-modal" />),
}));

jest.mock('../event-modal/EventModal', () => ({
    EventModal: jest.fn(() => <div data-testid="event-modal" />),
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

const mockedEventCategoryModal = EventCategoryModal as jest.Mock;
const mockedDeleteEventCategoryModal = DeleteEventCategoryModal as jest.Mock;
const mockedEventModal = EventModal as jest.Mock;

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

    const closeAddCategoryModal = jest.fn();
    const closeEditCategoryModal = jest.fn();
    const closeAddItemModal = jest.fn();
    const closeDeleteCategoryModal = jest.fn();
    const onAddCategory = jest.fn();
    const onUpdateCategory = jest.fn();
    const onDeleteCategory = jest.fn();

    const createModalsStateControl = (
        isAddCategoryModalOpen = false,
        isEditCategoryModalOpen = false,
        isAddModalOpen = false,
        isDeleteCategoryModalOpen = false,
    ): UseModalsStateResult<EventsNews> =>
        ({
            modalState: {
                isAddCategoryModalOpen,
                isEditCategoryModalOpen,
                isAddModalOpen,
                isDeleteCategoryModalOpen,
            },
            closeModalActions: {
                closeAddCategoryModal,
                closeEditCategoryModal,
                closeAddItemModal,
                closeDeleteCategoryModal,
            },
        }) as unknown as UseModalsStateResult<EventsNews>;

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
                modalsStateControl={createModalsStateControl(false, false, false)}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
            />,
        );

        const addModalProps = getModalPropsByMode(ModalMode.Add);
        const editModalProps = getModalPropsByMode(ModalMode.Edit);
        const deleteModalProps = mockedDeleteEventCategoryModal.mock.calls[0][0];
        const eventModalProps = mockedEventModal.mock.calls[0][0];

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

    it('renders toast container', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl()}
                categories={categories}
                currentCategory={currentCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
            />,
        );

        expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });
});
