import { DeleteEventCategoryModal } from '../delete-event-category-modal/DeleteEventCategoryModal';
import { EventCategoryModal } from '../event-category-modal/EventCategoryModal';
import { EventModal } from '../event-modal/EventModal';
import { TranslateEventCategoryModal } from '../translate-event-category-modal/TranslateEventCategoryModal';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventItemDto } from '@/types/admin/events';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ModalMode } from '@/types/admin/common';
import { LocalizationLanguage } from '@/types/common/language';

export interface EventsPageModalsProps {
    modalsStateControl: UseModalsStateResult<EventItemDto>;
    categories: EventCategoryDto[];
    currentCategory: EventCategoryDto | null;
    onAddCategory(category: EventCategoryDto): void;
    onUpdateCategory(category: EventCategoryDto): void;
    onDeleteCategory(categoryId: number): void;
    onTranslateCategory(category: EventCategoryDto): void;
    translationLanguages: LocalizationLanguage[];
}

export const EventsPageModals = ({
    modalsStateControl,
    categories,
    currentCategory,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onTranslateCategory,
    translationLanguages,
}: EventsPageModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;

    return (
        <>
            <EventModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddModalOpen}
                onClose={closeModalActions.closeAddItemModal}
                currentCategory={currentCategory}
            />

            {modalState.itemToEdit && (
                <EventModal
                    mode={ModalMode.Edit}
                    isOpen
                    onClose={closeModalActions.closeEditItemModal}
                    currentCategory={currentCategory}
                    eventToEdit={modalState.itemToEdit}
                />
            )}

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

            <TranslateEventCategoryModal
                isOpen={modalState.isCategoryToTranslate}
                categories={categories}
                onClose={closeModalActions.closeTranslateCategoryModal}
                translationLanguages={translationLanguages}
                onTranslateCategory={onTranslateCategory}
            />
        </>
    );
};
