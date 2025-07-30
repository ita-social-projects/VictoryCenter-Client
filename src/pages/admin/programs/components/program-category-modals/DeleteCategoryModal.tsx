import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/common/button/Button';
import { HintBox } from '../../../../../components/common/hint-box/HintBox';
import { ProgramCategory } from '../../../../../types/admin/Programs';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import './program-category-modal.scss';

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteCategory: (categoryId: number) => void;
    categories: ProgramCategory[];
}

export const DeleteCategoryModal = ({ isOpen, onClose, onDeleteCategory, categories }: DeleteCategoryModalProps) => {
    const [categoryId, setCategoryId] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const isSubmittingRef = useRef(false);

    const selectedCategory = categories.find((cat) => cat.id === categoryId);

    const handleSubmit = async () => {
        if (isSubmittingRef.current || !selectedCategory || selectedCategory.programsCount > 0) return;

        setError('');

        try {
            isSubmittingRef.current = true;
            setIsSubmitting(true);

            await ProgramsApi.deleteProgramCategory(selectedCategory.id);

            onDeleteCategory(selectedCategory.id);
            setCategoryId(0);
            onClose();
        } catch {
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY);
        } finally {
            isSubmittingRef.current = false;
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

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        setCategoryId(selectedId);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>{PROGRAM_CATEGORY_TEXT.FORM.TITLE.DELETE_CATEGORY}</Modal.Title>
            <Modal.Content>
                <div className="program-form-main">
                    <div className="form-group">
                        <label htmlFor="delete-category-select">
                            <span className="required-field">*</span>
                            {PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                        </label>
                        <select
                            id="delete-category-select"
                            onChange={handleCategoryChange}
                            disabled={isSubmitting}
                            value={categoryId}
                        >
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedCategory && selectedCategory.programsCount > 0 && (
                        <HintBox
                            title={PROGRAM_CATEGORY_VALIDATION.programsCount.getHasProgramsCountError(
                                selectedCategory.programsCount,
                            )}
                            text={PROGRAM_CATEGORY_VALIDATION.programsCount.getRelocationOrRemovalHint()}
                        />
                    )}
                    {error && <div className="error-container">{error}</div>}
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button buttonStyle="secondary" onClick={handleClose} disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                </Button>
                <Button
                    buttonStyle="primary"
                    onClick={handleSubmit}
                    disabled={!!(selectedCategory && selectedCategory.programsCount > 0) || isSubmitting}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.DELETE}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default DeleteCategoryModal;
