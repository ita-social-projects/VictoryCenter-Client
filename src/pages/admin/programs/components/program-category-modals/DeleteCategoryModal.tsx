import React, { useEffect, useRef, useState } from 'react';
import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import { ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from "../../../../../const/admin/programs";
import InfoIcon from "../../../../../assets/icons/info.svg";
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';

export const DeleteCategoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onDeleteCategory: (categoryId: number) => void;
    categories: ProgramCategory[];
}> = ({ isOpen, onClose, onDeleteCategory, categories }) => {
    const [categoryToDelete, setCategoryToDelete] = useState<ProgramCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const isSubmittingRef = useRef(false);

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            setError('');

            await ProgramsApi.deleteCategory(categoryToDelete.id);

            onDeleteCategory(categoryToDelete.id);
            handleClose();
        } catch (error) {
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY);
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCategoryToDelete(null);
        setError('');
        onClose();
    };

    useEffect(() => {
        if (isOpen && categories.length > 0) {
            setCategoryToDelete(categories[0]);
        }
    }, [isOpen, categories]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>
                <span className={'program-form-header'}>Видалити категорію</span>
            </Modal.Title>
            <Modal.Content>
                <div className="program-form-main">
                    <div className='form-group'>
                        <label htmlFor="delete-category-select">Категорія</label>
                        <select
                            id="delete-category-select"
                            value={categoryToDelete?.id || ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selected = categories.find(cat => cat.id === selectedId);
                                if (selected) {
                                    setCategoryToDelete(selected);
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

                    {categoryToDelete && categoryToDelete.programsCount > 0 && (
                        <div className="delete-category-warning">
                            <div className="warning-icon-container">
                                <img src={InfoIcon} alt="info-icon" className="warning-info-icon" />
                            </div>
                            <div className="warning-text">
                                <div className="warning-title">
                                    {PROGRAM_CATEGORY_VALIDATION.programsCount
                                        .getProgramsCountWarning(categoryToDelete.programsCount)}
                                </div>
                                <div className="warning-description">
                                    {PROGRAM_CATEGORY_VALIDATION.programsCount
                                        .getRelocationOrRemovalNotice()}
                                </div>
                            </div>
                        </div>
                    )}
                    {error && (<span className='error'>{error}</span>)}
                </div>
            </Modal.Content>
            <Modal.Actions>
                <div className="program-form-buttons-container">
                    <Button
                        type='button'
                        buttonStyle='secondary'
                        className={'cancel-button'}
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CANCEL_DELETE}
                    </Button>
                    <Button
                        type='submit'
                        buttonStyle='primary'
                        disabled={!!(categoryToDelete && categoryToDelete.programsCount > 0) || isSubmitting}
                        className={'publisher-button'}
                        onClick={handleDelete}
                    >
                        {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CONFIRM_DELETE}
                    </Button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};
