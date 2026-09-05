import { DeleteEventCategoryModal } from '../delete-event-category-modal/DeleteEventCategoryModal';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';
import { EventModal } from '../event-modal/EventModal';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventsNews } from '@/types/admin/events-news';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ModalMode } from '@/types/admin/common';

export interface EventsPageModalsProps {
    modalsStateControl: UseModalsStateResult<EventsNews>;
    categories: EventCategoryDto[];
    currentCategory: EventCategoryDto | null;
    onAddCategory(category: EventCategoryDto): void;
    onUpdateCategory(category: EventCategoryDto): void;
    onDeleteCategory(categoryId: number): void;
}

export const EventsPageModals = ({
    modalsStateControl,
    categories,
    currentCategory,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
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

            <DeleteEventCategoryModal
                isOpen={modalState.isDeleteCategoryModalOpen}
                categories={categories}
                onClose={closeModalActions.closeDeleteCategoryModal}
                onConfirm={onDeleteCategory}
            />
            <ToastContainer />
        </>
    );
};
