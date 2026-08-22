import { EventsNews } from '@/types/admin/events-news';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventCategory } from '@/types/admin/event-category';
import { ModalMode } from '@/types/admin/common';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';

export interface EventsPageModalsProps {
    modalsStateControl: UseModalsStateResult<EventsNews>;
    categories: EventCategory[];

    onAddEventCategory: (newCategory: EventCategory) => void;
    onEditEventCategory: (updatedCategory: EventCategory) => void;
}

export const EventsPageModals = ({
    modalsStateControl,
    categories,
    onAddEventCategory,
    onEditEventCategory,
}: EventsPageModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;

    return (
        <>
            <EventCategoryModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddCategoryModalOpen}
                onClose={closeModalActions.closeAddCategoryModal}
                onAddCategory={onAddEventCategory}
                categories={categories}
            />

            <EventCategoryModal
                mode={ModalMode.Edit}
                isOpen={modalState.isEditCategoryModalOpen}
                onClose={closeModalActions.closeEditCategoryModal}
                onEditCategory={onEditEventCategory}
                categories={categories}
            />
        </>
    );
};
