import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { ModalMode } from '@/types/admin/common';
import { TeamCategory } from '@/types/admin/team-category';
import { TeamMember } from '@/types/admin/team-members';
import { TeamMemberModal } from '../team-member-modal/TeamMemberModal';
import { DeleteTeamMemberModal } from '../delete-team-member-modal/DeleteTeamMemberModal';
import { TranslateTeamMemberModal } from '../translate-team-member-modal/TranslateTeamMemberModal';
import { TeamCategoryModal } from '../team-category-modal/TeamCategoryModal';
import { DeleteTeamCategoryModal } from '../delete-team-category-modal/DeleteTeamCategoryModal';
import { LocalizationLanguage } from '@/types/common/language';

export interface TeamPageModalsProps {
    modalsStateControl: UseModalsStateResult<TeamMember>;
    categories: TeamCategory[];
    translatedLanguages: LocalizationLanguage[];
    onAddTeamMember: (addedMember: TeamMember) => void;
    onEditTeamMember: (updatedMember: TeamMember) => void;
    onTranslateTeamMember: (translatedMember: TeamMember) => void;
    onDeleteTeamMember: (member: TeamMember) => void;
    onAddTeamCategory: (newCategory: TeamCategory) => void;
    onEditTeamCategory: (updatedCategory: TeamCategory) => void;
    onDeleteTeamCategory: (categoryIdToDelete: number) => void;
}

export const TeamPageModals = ({
    modalsStateControl,
    categories,
    translatedLanguages,
    onAddTeamMember,
    onTranslateTeamMember,
    onEditTeamMember,
    onDeleteTeamMember,
    onAddTeamCategory,
    onEditTeamCategory,
    onDeleteTeamCategory,
}: TeamPageModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;

    return (
        <>
            {/* Team Member Modals */}
            <TeamMemberModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddModalOpen}
                onClose={closeModalActions.closeAddItemModal}
                onAddMember={onAddTeamMember}
                categories={categories}
            />

            <TeamMemberModal
                mode={ModalMode.Edit}
                isOpen={!!modalState.itemToEdit}
                onClose={closeModalActions.closeEditItemModal}
                memberToEdit={modalState.itemToEdit!}
                onEditMember={onEditTeamMember}
                categories={categories}
            />

            <DeleteTeamMemberModal
                isOpen={!!modalState.itemToDelete}
                onClose={closeModalActions.closeDeleteItemModal}
                memberToDelete={modalState.itemToDelete}
                onDeleteMember={onDeleteTeamMember}
            />

            {modalState.itemToTranslate && (
                <TranslateTeamMemberModal
                    isOpen={!!modalState.itemToTranslate}
                    onClose={closeModalActions.closeTranslateItemModal}
                    onTranslateMember={onTranslateTeamMember}
                    memberToTranslate={modalState.itemToTranslate}
                    translatedLanguages={translatedLanguages}
                />
            )}

            {modalState.itemToEditTranslation && (
                <TranslateTeamMemberModal
                    isOpen={!!modalState.itemToEditTranslation}
                    onClose={closeModalActions.closeEditTranslationModal}
                    onTranslateMember={onTranslateTeamMember}
                    memberToTranslate={modalState.itemToEditTranslation}
                    translatedLanguages={translatedLanguages}
                />
            )}

            {/* Team Category Modals */}
            <TeamCategoryModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddCategoryModalOpen}
                onClose={closeModalActions.closeAddCategoryModal}
                onAddCategory={onAddTeamCategory}
                categories={categories}
            />

            <TeamCategoryModal
                mode={ModalMode.Edit}
                isOpen={modalState.isEditCategoryModalOpen}
                onClose={closeModalActions.closeEditCategoryModal}
                onEditCategory={onEditTeamCategory}
                categories={categories}
            />

            <DeleteTeamCategoryModal
                isOpen={modalState.isDeleteCategoryModalOpen}
                onClose={closeModalActions.closeDeleteCategoryModal}
                onConfirm={onDeleteTeamCategory}
                categories={categories}
            />
        </>
    );
};
