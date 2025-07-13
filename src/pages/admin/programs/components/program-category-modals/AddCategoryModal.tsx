import React, { useEffect, useRef, useState } from 'react';
import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import { ProgramCategory, ProgramCategoryCreateUpdate,} from '../../../../../types/ProgramAdminPage';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from "../../../../../const/admin/programs";
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';

export const AddCategoryModal = ({
    isOpen,
    onClose,
    onAddCategory,
    categories,
}: {
    isOpen: boolean;
    onClose: () => void;
    onAddCategory: (category: ProgramCategory) => void;
    categories: ProgramCategory[];
}) => {
    const [categoryNameToAdd, setCategoryNameToAdd] = useState<string>('');
    const [isDuplicateName, setIsDuplicateName] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const isSubmittingRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmittingRef.current  || !categoryNameToAdd.trim() || isDuplicateName) {
            return;
        }

        try {
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            setError('');

            const categoryToCreate: ProgramCategoryCreateUpdate = {
                id: null,
                name: categoryNameToAdd.trim()
            };

            const newCategory =  await ProgramsApi.addProgramCategory(categoryToCreate);

            onAddCategory(newCategory);
            setCategoryNameToAdd('');
            onClose();
        } catch (error) {
            // Or handle in your way
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY);
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (categoryNameToAdd.trim()) {
            const isDuplicate = categories.some(category =>
                category.name.toLowerCase() === categoryNameToAdd.trim().toLowerCase()
            );
            setIsDuplicateName(isDuplicate);
        } else {
            setIsDuplicateName(false);
        }
    }, [categoryNameToAdd, categories]);

    const handleClose = () => {
        if (isSubmitting) return;

        setCategoryNameToAdd('');
        setError('');
        setIsDuplicateName(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>
                <span className={'program-form-header'}>
                    {PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY}
                </span>
            </Modal.Title>
            <Modal.Content>
                <form onSubmit={handleSubmit} className="program-form-main">
                    <div className='form-group form-group-name'>
                        <label htmlFor="add-category-name">
                            {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                        </label>
                        <input
                            value={categoryNameToAdd}
                            onChange={(e) => setCategoryNameToAdd(e.target.value)}
                            maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                            name='name'
                            type="text"
                            id='add-category-name'
                            required
                            disabled={isSubmitting}
                        />
                        <div className='form-group-name-lenght-limit'>
                            {categoryNameToAdd.length}/{PROGRAM_CATEGORY_VALIDATION.name.max}
                        </div>
                        <div className='form-group'>
                            {isDuplicateName && (
                                <span className='error'>
                                    {PROGRAM_CATEGORY_VALIDATION.name.getUniqueNameError()}
                                </span>
                            )}
                            {error && (<span className='error'>{error}</span>)}
                        </div>
                    </div>
                </form>
            </Modal.Content>
            <Modal.Actions>
                <div className='program-form-buttons-container'>
                    <Button
                        type="submit"
                        buttonStyle="primary"
                        disabled={isSubmitting || isDuplicateName || !categoryNameToAdd.trim()}
                    >
                    {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CONFIRM_SAVE}
                    </Button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};
