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
    const onAddEventCategory = jest.fn();
    const onEditEventCategory = jest.fn();

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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders add category modal', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(true)}
                categories={categories}
            />,
        );

        const addModalProps = mockedEventCategoryModal.mock.calls[0][0];

        expect(addModalProps).toEqual(
            expect.objectContaining({
                mode: ModalMode.Add,
                isOpen: true,
                onClose: closeAddCategoryModal,
                categories,
            }),
        );
    });

    it('renders edit category modal', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, true)}
                categories={categories}
            />,
        );

        const editModalProps = mockedEventCategoryModal.mock.calls[1][0];

        expect(editModalProps).toEqual(
            expect.objectContaining({
                mode: ModalMode.Edit,
                isOpen: true,
                onClose: closeEditCategoryModal,
                categories,
            }),
        );
    });

    it('passes false as isOpen when both category modals are closed', () => {
        render(
            <EventsPageModals
                modalsStateControl={createModalsStateControl(false, false)}
                categories={categories}
            />,
        );

        const addModalProps = mockedEventCategoryModal.mock.calls[0][0];
        const editModalProps = mockedEventCategoryModal.mock.calls[1][0];

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
