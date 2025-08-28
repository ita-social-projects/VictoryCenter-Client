import { UseModalsStateResult } from '../../../../../hooks/admin/use-modals-state/useModalsState';
import { FaqQuestion, VisitorPage } from '../../../../../types/admin/faq';
import { DeleteFaqModal } from './delete-faq-modal/DeleteFaqModal';
import { FaqModal } from './faq-modal/FaqModal';

export interface FaqModalsProps {
    modalsStateControl: UseModalsStateResult<FaqQuestion>;
    pages: VisitorPage[];
    onAddFaq: (addedFaq: FaqQuestion) => void;
    onEditFaq: (updatedFaq: FaqQuestion) => void;
    onDeleteFaq: (faq: FaqQuestion) => void;
}

export const FaqModals = ({ modalsStateControl, pages, onAddFaq, onEditFaq, onDeleteFaq }: FaqModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;
    return (
        <>
            {/* Faq Modals */}
            <FaqModal
                mode="add"
                isOpen={modalState.isAddModalOpen}
                onClose={closeModalActions.closeAddItemModal}
                onAddFaq={onAddFaq}
                pages={pages}
            />

            <FaqModal
                mode="edit"
                isOpen={!!modalState.itemToEdit}
                onClose={closeModalActions.closeEditItemModal}
                faqToEdit={modalState.itemToEdit!}
                onEditFaq={onEditFaq}
                pages={pages}
            />

            <DeleteFaqModal
                isOpen={!!modalState.itemToDelete}
                onClose={closeModalActions.closeDeleteItemModal}
                faqToDelete={modalState.itemToDelete!}
                onDeleteFaq={onDeleteFaq}
            />
        </>
    );
};
