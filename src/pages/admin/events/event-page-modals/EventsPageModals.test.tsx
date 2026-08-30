import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventsPageModals } from './EventsPageModals';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';
import { ModalMode } from '@/types/admin/common';
import { EventCategory } from '@/types/admin/event-category';
import { EventsNews } from '@/types/admin/events-news';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';

jest.mock('../event-category-modal/EventCategoryModal', () => ({
    EventCategoryModal: jest.fn(() => <div data-testid="event-category-modal" />),
}));

const mockedEventCategoryModal = EventCategoryModal as jest.Mock;

describe('EventsPageModals', () => {
    const categories: EventCategory[] = [
        {
            id: 1,
            name: 'Category 1',
        },
        {
            id: 2,
            name: 'Category 2',
        },
    ];

    const closeAddCategoryModal = jest.fn();
    const closeEditCategoryModal = jest.fn();
    const onAddCategory = jest.fn();
    const onUpdateCategory = jest.fn();

    const createModalsStateControl = (
        isAddCategoryModalOpen = false,
        isEditCategoryModalOpen = false,
    ): UseModalsStateResult<EventsNews> =>
        ({
            modalState: {
                isAddCategoryModalOpen,
                isEditCategoryModalOpen,
            },
            closeModalActions: {
                closeAddCategoryModal,
                closeEditCategoryModal,
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
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
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
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
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

    it('passes false as isOpen when both category modals are closed', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, false)}
                categories={categories}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
            />,
        );

        const addModalProps = getModalPropsByMode(ModalMode.Add);
        const editModalProps = getModalPropsByMode(ModalMode.Edit);

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
    });
});
