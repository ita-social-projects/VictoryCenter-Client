import React, { useEffect, useRef, useState } from 'react';
import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import {ProgramCategory, ProgramCategoryCreateUpdate} from '../../../../../types/ProgramAdminPage';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from "../../../../../const/admin/programs";
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';

export const EditCategoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onEditCategory: (category: ProgramCategory) => void;
    categories: ProgramCategory[];
}> = ({ isOpen, onClose, onEditCategory, categories }) => {
    const [categoryToEdit, setCategoryToEdit] = useState<ProgramCategory | null>(null);
    const [editCategoryName, setEditCategoryName] = useState<string>('');
    const [isDuplicateName, setIsDuplicateName] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const isSubmittingRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryToEdit || !editCategoryName.trim() || isDuplicateName) {
            return;
        }

        try {
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            setError('');

            const categoryToUpdate: ProgramCategoryCreateUpdate = {
                id: categoryToEdit.id,
                name: editCategoryName.trim()
            };

            const updatedCategory = await ProgramsApi.editCategory(categoryToUpdate);
            onEditCategory(updatedCategory);
            handleClose();
        } catch (error) {
            // Or handle in your way
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY);
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCategoryToEdit(null);
        setEditCategoryName('');
        setError('');
        setIsDuplicateName(false);
        onClose();
    };

    useEffect(() => {
        if (editCategoryName.trim() && categoryToEdit) {
            const isDuplicate = categories.some(category =>
                category.id !== categoryToEdit.id &&
                category.name.toLowerCase() === editCategoryName.trim().toLowerCase()
            );
            setIsDuplicateName(isDuplicate);
        } else {
            setIsDuplicateName(false);
        }
    }, [editCategoryName, categories, categoryToEdit]);

    useEffect(() => {
        if (isOpen && categories.length > 0) {
            setCategoryToEdit(categories[0]);
            setEditCategoryName(categories[0].name);
        }
    }, [isOpen, categories]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>
                <span className={'program-form-header'}>{PROGRAM_CATEGORY_TEXT.FORM.TITLE.EDIT_CATEGORY}</span>
            </Modal.Title>
            <Modal.Content>
                <form onSubmit={handleSubmit} className="program-form-main">
                    <div className='form-group'>
                        <label htmlFor="edit-category-select">{PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}</label>
                        <select
                            id="edit-category-select"
                            value={categoryToEdit?.id || ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selected = categories.find(cat => cat.id === selectedId);
                                if (selected) {
                                    setCategoryToEdit(selected);
                                    setEditCategoryName(selected.name);
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group form-group-name'>
                        <label htmlFor="edit-category-name">{PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}</label>
                        <input
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                            name='name'
                            type="text"
                            id='edit-category-name'
                            required
                            disabled={isSubmitting}
                        />
                        <div className='form-group-name-lenght-limit'>
                            {editCategoryName.length}/{PROGRAM_CATEGORY_VALIDATION.name.max}
                        </div>
                        {isDuplicateName && (
                            <span className='error'>
                                {PROGRAM_CATEGORY_VALIDATION.name.getUniqueNameError()}
                            </span>
                        )}
                        {error && (<span className='error'>{error}</span>)}
                    </div>
                </form>
            </Modal.Content>
            <Modal.Actions>
                <div className='program-form-buttons-container'>
                    <Button
                        type="submit"
                        buttonStyle="primary"
                        disabled={isSubmitting || isDuplicateName || !editCategoryName.trim()}
                    >
                        {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CONFIRM_SAVE}
                    </Button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};
