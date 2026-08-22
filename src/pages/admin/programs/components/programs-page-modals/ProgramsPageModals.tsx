import { HippotherapyProgram, ProgramCategory } from '@/types/admin/programs';
import { LocalizationLanguage } from '@/types/common/language';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { ProgramModal } from './program-modal/ProgramModal';
import { DeleteProgramModal } from './delete-program-modal/DeleteProgramModal';
import { ProgramCategoryModal } from '../program-category-modals/ProgramCategoryModal';
import { DeleteCategoryModal } from '../program-category-modals/DeleteCategoryModal';
import { TranslateProgramModal } from '../translate-program-modal/TranslateProgramModal';
import { TranslateProgramCategoryModal } from '../translate-program-category-modal/TranslateProgramCategoryModal';
import { ModalMode } from '@/types/admin/common';

export interface ProgramsPageModalsProps {
    modalsStateControl: UseModalsStateResult<HippotherapyProgram>;
    categories: ProgramCategory[];
    onAddProgram: (addedProgram: HippotherapyProgram) => void;
    onEditProgram: (updatedProgram: HippotherapyProgram) => void;
    onDeleteProgram: (program: HippotherapyProgram) => void;
    onTranslateProgram: (program: HippotherapyProgram) => void;
    translatedLanguages: LocalizationLanguage[];
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
    onTranslateProgram,
    translatedLanguages,
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

            <TranslateProgramModal
                isOpen={!!modalState.itemToTranslate}
                onClose={closeModalActions.closeTranslateItemModal}
                programToTranslate={modalState.itemToTranslate!}
                onTranslateProgram={onTranslateProgram}
                translatedLanguages={translatedLanguages}
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

            {modalState.isCategoryToTranslate && (
                <TranslateProgramCategoryModal
                    isOpen={modalState.isCategoryToTranslate}
                    onClose={closeModalActions.closeTranslateCategoryModal}
                    categories={categories}
                    translatedLanguages={translatedLanguages}
                />
            )}
        </>
    );
};
