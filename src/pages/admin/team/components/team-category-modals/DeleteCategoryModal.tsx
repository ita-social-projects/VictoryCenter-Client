import { useEffect, useState } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/admin/button/Button';
import { HintBox } from '../../../../../components/admin/hint-box/HintBox';
import { SingleSelectInputGroup } from '../../../../../components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './TeamCategoryModal.scss';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TeamCategory } from '../../../../../types/admin/team-category';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-categories/team-categories-api';
import { TEAM_CATEGORY_VALIDATION } from '../../../../../const/admin/team';

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (categoryId: number) => void;
    categories: TeamCategory[];
}

export const DeleteCategoryModal = ({ isOpen, onClose, onConfirm, categories }: DeleteCategoryModalProps) => {
    const client = useAdminClient();
    const [selectedCategory, setSelectedCategory] = useState<TeamCategory>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (isSubmitting || !selectedCategory || selectedCategory.teamMembersCount > 0) return;

        setError('');

        try {
            setIsSubmitting(true);

            await TeamCategoriesApi.delete(client, selectedCategory.id);

            onConfirm(selectedCategory.id);
            setSelectedCategory(undefined);
            onClose();
        } catch {
            setError(COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setSelectedCategory(undefined);
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (categories.length > 0) {
                setSelectedCategory(categories[0]);
            }
        }
    }, [isOpen, categories]);

    const handleCategoryChange = (category: TeamCategory) => {
        setSelectedCategory(category);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>{COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY}</Modal.Title>
            <Modal.Content>
                <div className="program-form-main">
                    <SingleSelectInputGroup
                        id="delete-category-select"
                        label={COMMON_TEXT_ADMIN.CATEGORIES.FORM.LABEL.CATEGORY}
                        isRequired={true}
                        options={categories}
                        getOptionId={(c) => c.id}
                        getOptionName={(c) => c.name}
                        placeholder=""
                        onChange={handleCategoryChange}
                        disabled={isSubmitting}
                        value={selectedCategory}
                    />
                    {selectedCategory && selectedCategory.teamMembersCount > 0 && (
                        <HintBox
                            title={TEAM_CATEGORY_VALIDATION.teamMembersCount.getHasTeamMembersCountError(
                                selectedCategory.teamMembersCount,
                            )}
                            text={TEAM_CATEGORY_VALIDATION.teamMembersCount.getRelocationOrRemovalHint()}
                        />
                    )}
                    {error && <div className="program-category-modal-error-container">{error}</div>}
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button buttonStyle="secondary" onClick={handleClose} disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                </Button>
                <Button
                    buttonStyle="primary"
                    onClick={handleSubmit}
                    disabled={(!!selectedCategory && selectedCategory.teamMembersCount > 0) || isSubmitting}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.DELETE}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
