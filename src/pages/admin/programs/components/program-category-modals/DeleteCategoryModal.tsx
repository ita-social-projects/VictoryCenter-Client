import React, { useEffect, useState } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/admin/button/Button';
import { HintBox } from '../../../../../components/admin/hint-box/HintBox';
import { SingleSelectInputGroup } from '../../../../../components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ProgramsCategoriesApi } from '../../../../../services/api/admin/programs/programs-api';
import { ProgramCategory } from '../../../../../types/admin/programs';
import './ProgramCategoryModal.scss';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteCategory: (categoryId: number) => void;
    categories: ProgramCategory[];
}

export const DeleteCategoryModal = ({ isOpen, onClose, onDeleteCategory, categories }: DeleteCategoryModalProps) => {
    const client = useAdminClient();
    const [categoryId, setCategoryId] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const selectedCategory = categories.find((cat) => cat.id === categoryId);

    const handleSubmit = async () => {
        if (isSubmitting || !selectedCategory || selectedCategory.programsCount > 0) return;

        setError('');

        try {
            setIsSubmitting(true);

            await ProgramsCategoriesApi.deleteProgramCategory(selectedCategory.id, client);

            onDeleteCategory(selectedCategory.id);
            setCategoryId(0);
            onClose();
        } catch {
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setCategoryId(0);
        onClose();
    };

    useEffect(() => {
        if (isOpen && categories.length > 0) {
            setCategoryId(categories[0].id);
        }
    }, [isOpen, categories]);

    useEffect(() => {
        if (isOpen) {
            setError('');
        }
    }, [isOpen]);

    const handleCategoryChange = (category: ProgramCategory) => {
        setCategoryId(category.id);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>{PROGRAM_CATEGORY_TEXT.FORM.TITLE.DELETE_CATEGORY}</Modal.Title>
            <Modal.Content>
                <div className="program-form-main">
                    <SingleSelectInputGroup
                        id="delete-category-select"
                        label={PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                        isRequired={true}
                        options={categories}
                        getOptionId={(c) => c.id}
                        getOptionName={(c) => c.name}
                        placeholder=""
                        onChange={handleCategoryChange}
                        disabled={isSubmitting}
                        value={selectedCategory}
                    />
                    {selectedCategory && selectedCategory.programsCount > 0 && (
                        <HintBox
                            title={PROGRAM_CATEGORY_VALIDATION.programsCount.getHasProgramsCountError(
                                selectedCategory.programsCount,
                            )}
                            text={PROGRAM_CATEGORY_VALIDATION.programsCount.getRelocationOrRemovalHint()}
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
                    disabled={(!!selectedCategory && selectedCategory.programsCount > 0) || isSubmitting}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.DELETE}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
