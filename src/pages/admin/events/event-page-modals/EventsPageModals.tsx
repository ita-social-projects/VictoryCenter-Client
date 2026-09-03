import { EventsNews } from '@/types/admin/events-news';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ModalMode } from '@/types/admin/common';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';
import { DeleteEventCategoryModal } from '../delete-event-category-modal/DeleteEventCategoryModal';

export interface EventsPageModalsProps {
    modalsStateControl: UseModalsStateResult<EventsNews>;
    categories: EventCategoryDto[];

    onAddCategory(category: EventCategoryDto): void;
    onUpdateCategory(category: EventCategoryDto): void;
    onDeleteCategory(categoryId: number): void;
}

export const EventsPageModals = ({
    modalsStateControl,
    categories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
}: EventsPageModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;

    return (
        <>
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

            <DeleteEventCategoryModal
                isOpen={modalState.isDeleteCategoryModalOpen}
                categories={categories}
                onClose={closeModalActions.closeDeleteCategoryModal}
                onConfirm={onDeleteCategory}
            />
        </>
    );
};
