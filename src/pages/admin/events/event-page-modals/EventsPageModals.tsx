import { EventsNews } from '@/types/admin/events-news';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventCategory } from '@/types/admin/event-category';
import { ModalMode } from '@/types/admin/common';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';
import { EventModal } from '../event-modal/EventModal';

export interface EventsPageModalsProps {
    modalsStateControl: UseModalsStateResult<EventsNews>;
    categories: EventCategory[];
    currentCategory: EventCategory | null;
    onAddCategory(category: EventCategory): void;
    onUpdateCategory(category: EventCategory): void;
}

export const EventsPageModals = ({
    modalsStateControl,
    categories,
    currentCategory,
    onAddCategory,
    onUpdateCategory,
}: EventsPageModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;

    return (
        <>
            <EventModal
                isOpen={modalState.isAddModalOpen}
                onClose={closeModalActions.closeAddItemModal}
                currentCategory={currentCategory}
            />

            <EventCategoryModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddCategoryModalOpen}
                onClose={closeModalActions.closeAddCategoryModal}
                categories={categories}
                onAddCategory={onAddCategory}
            />

            <EventCategoryModal
                mode={ModalMode.Edit}
                isOpen={modalState.isEditCategoryModalOpen}
                onClose={closeModalActions.closeEditCategoryModal}
                categories={categories}
                onUpdateCategory={onUpdateCategory}
            />
        </>
    );
};
