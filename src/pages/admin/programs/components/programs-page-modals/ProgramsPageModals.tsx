import { Program, ProgramCategory } from '../../../../../types/admin/programs';
import { UseModalsStateResult } from '../../../../../hooks/admin/use-modals-state/useModalsState';
import { ProgramModal } from './program-modal/ProgramModal';
import { DeleteProgramModal } from './delete-program-modal/DeleteProgramModal';
import { ProgramCategoryModal } from '../program-category-modals/ProgramCategoryModal';
import { DeleteCategoryModal } from '../program-category-modals/DeleteCategoryModal';
import { ModalMode } from '../../../../../types/admin/common';

export interface ProgramsPageModalsProps {
    modalsStateControl: UseModalsStateResult<Program>;
    categories: ProgramCategory[];
    onAddProgram: (addedProgram: Program) => void;
    onEditProgram: (updatedProgram: Program) => void;
    onDeleteProgram: (program: Program) => void;
    onAddCategory: (newCategory: ProgramCategory) => void;
    onEditCategory: (updatedCategory: ProgramCategory) => void;
    onDeleteCategory: (categoryIdToDelete: number) => void;
}

export const ProgramsPageModals = ({
    modalsStateControl,
    categories,
    onAddProgram,
    onEditProgram,
    onDeleteProgram,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
}: ProgramsPageModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;
    return (
        <>
            {/* Program Modals */}
            <ProgramModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddModalOpen}
                onClose={closeModalActions.closeAddItemModal}
                onAddProgram={onAddProgram}
                categories={categories}
            />

            <ProgramModal
                mode={ModalMode.Edit}
                isOpen={!!modalState.itemToEdit}
                onClose={closeModalActions.closeEditItemModal}
                programToEdit={modalState.itemToEdit!}
                onEditProgram={onEditProgram}
                categories={categories}
            />

            <DeleteProgramModal
                isOpen={!!modalState.itemToDelete}
                onClose={closeModalActions.closeDeleteItemModal}
                programToDelete={modalState.itemToDelete!}
                onDeleteProgram={onDeleteProgram}
            />

            {/* Category Modals */}
            <ProgramCategoryModal
                mode="add"
                isOpen={modalState.isAddCategoryModalOpen}
                onClose={closeModalActions.closeAddCategoryModal}
                categories={categories}
                onAddCategory={onAddCategory}
            />

            <ProgramCategoryModal
                mode="edit"
                isOpen={modalState.isEditCategoryModalOpen}
                onClose={closeModalActions.closeEditCategoryModal}
                categories={categories}
                onEditCategory={onEditCategory}
            />

            <DeleteCategoryModal
                isOpen={modalState.isDeleteCategoryModalOpen}
                onClose={closeModalActions.closeDeleteCategoryModal}
                onDeleteCategory={onDeleteCategory}
                categories={categories}
            />
        </>
    );
};
