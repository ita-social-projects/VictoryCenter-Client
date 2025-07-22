import React, { useEffect, useRef, useState } from 'react';
import Modal from '../../../../../components/common/modal/Modal';
import Button from '../../../../../components/common/button/Button';
import HintContainer from '../../../../../components/common/hint/HintContainer';
import InputWithCharacterLimit from '../../../../../components/common/input-with-character-limit/InputWithCharacterLimit';
import QuestionModal from '../../../../../components/common/question-modal/QuestionModal';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ProgramCategory, ProgramCategoryCreateUpdate } from '../../../../../types/ProgramAdminPage';
import { ProgramCategoryValidationSchema } from '../../../../../validation/admin/program-category-schema/program-category-schema';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './program-category-modal.scss';

type EditProgramCategoryFormValues = {
    name: string;
};

interface EditCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditCategory: (category: ProgramCategory) => void;
    categories: ProgramCategory[];
}

export const EditCategoryModal = ({ isOpen, onClose, onEditCategory, categories }: EditCategoryModalProps) => {
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const selectedCategoryRef = useRef<null | ProgramCategory>(null);
    const [error, setError] = useState('');

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<EditProgramCategoryFormValues>({
        mode: 'onBlur',
        resolver: yupResolver(ProgramCategoryValidationSchema),
        defaultValues: {
            name: '',
        },
    });

    const nameValue = watch('name') || '';

    const isDuplicateName = categories.some(
        (category) =>
            category.id !== selectedCategoryRef.current?.id &&
            category.name.trim().toLowerCase() === nameValue.trim().toLowerCase(),
    );

    const onSubmit = async (data: EditProgramCategoryFormValues) => {
        if (isSubmitting || isDuplicateName || !selectedCategoryRef.current) return;

        setError('');

        try {
            const categoryToUpdate: ProgramCategoryCreateUpdate = {
                id: selectedCategoryRef.current.id,
                name: data.name.trim(),
            };

            const updatedCategory = await ProgramsApi.editCategory(categoryToUpdate);

            onEditCategory(updatedCategory);
            onClose();
        } catch (err) {
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;

        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        onClose();
    };

    const handleConfirmClose = () => {
        setShowCloseConfirmModal(false);
        onClose();
    };

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            if (categories.length > 0) {
                const firstCategory = categories[0];
                selectedCategoryRef.current = firstCategory;
                reset({ name: firstCategory.name });
            }
            setError('');
        }
    }, [isOpen, categories, reset]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selected = categories.find((cat) => cat.id === selectedId);
        if (selected) {
            selectedCategoryRef.current = selected;
            reset({ name: selected.name });
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{PROGRAM_CATEGORY_TEXT.FORM.TITLE.EDIT_CATEGORY}</Modal.Title>
                <Modal.Content>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="program-form-main"
                        id="edit-program-category-form"
                    >
                        <div className="form-group">
                            <label htmlFor="edit-category-select">
                                <span className="required-field">*</span>
                                {PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                            </label>
                            <select
                                id="edit-category-select"
                                onChange={handleCategoryChange}
                                disabled={isSubmitting}
                                value={selectedCategoryRef.current?.id || ''}
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group form-group-name">
                            <label htmlFor="edit-category-name">
                                <span className="required-field">*</span>
                                {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                            </label>
                            <Controller
                                name={'name'}
                                control={control}
                                render={({ field }) => (
                                    <InputWithCharacterLimit
                                        {...field}
                                        id="edit-category-name"
                                        maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.name && <span className="error">{errors.name.message}</span>}
                        </div>
                        {isDuplicateName && (
                            <HintContainer
                                title={PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError()}
                            />
                        )}
                        {error && <div className="error-container">{error}</div>}
                    </form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        type="submit"
                        form="edit-program-category-form"
                        buttonStyle="primary"
                        className="w-100"
                        disabled={isSubmitting || isDuplicateName || !nameValue.trim() || !isDirty}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE}
                    </Button>
                </Modal.Actions>
            </Modal>

            <QuestionModal
                isOpen={showCloseConfirmModal}
                isSubmitting={false}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onClose={() => setShowCloseConfirmModal(false)}
                onCancel={() => setShowCloseConfirmModal(false)}
                onConfirm={handleConfirmClose}
            />
        </>
    );
};

export default EditCategoryModal;
