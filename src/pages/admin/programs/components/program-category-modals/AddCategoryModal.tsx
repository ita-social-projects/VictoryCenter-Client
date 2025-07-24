import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/common/button/Button';
import { HintBox } from '../../../../../components/common/hint-box/HintBox';
import { InputWithCharacterLimit } from '../../../../../components/common/input-with-character-limit/InputWithCharacterLimit';
import QuestionModal from '../../../../../components/common/question-modal/QuestionModal';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ProgramCategory, ProgramCategoryCreateUpdate } from '../../../../../types/ProgramAdminPage';
import { ProgramCategoryValidationSchema } from '../../../../../validation/admin/program-category-schema/program-category-schema';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import './program-category-modal.scss';

type AddProgramCategoryFormValues = {
    name: string;
};

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCategory: (category: ProgramCategory) => void;
    categories: ProgramCategory[];
}

export const AddCategoryModal = ({ isOpen, onClose, onAddCategory, categories }: AddCategoryModalProps) => {
    const [error, setError] = useState('');
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<AddProgramCategoryFormValues>({
        mode: 'onBlur',
        resolver: yupResolver(ProgramCategoryValidationSchema),
        defaultValues: {
            name: '',
        },
    });

    const nameValue = watch('name') || '';

    const isDuplicateName = categories.some(
        (category) => category.name.trim().toLowerCase() === nameValue.trim().toLowerCase(),
    );

    const onSubmit = async (data: AddProgramCategoryFormValues) => {
        if (isSubmitting || isDuplicateName) return;

        setError('');

        try {
            const categoryToCreate: ProgramCategoryCreateUpdate = {
                id: null,
                name: data.name.trim(),
            };

            const newCategory = await ProgramsApi.addProgramCategory(categoryToCreate);

            onAddCategory(newCategory);
            onClose();
        } catch (err) {
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY);
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

    useEffect(() => {
        if (isOpen) {
            reset();
            setError('');
        }
    }, [isOpen, reset]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY}</Modal.Title>
                <Modal.Content>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="program-form-main"
                        id="add-program-category-form"
                    >
                        <div className="form-group">
                            <label htmlFor="add-category-name">
                                <span className="required-field">*</span>
                                {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                            </label>
                            <Controller
                                name={'name'}
                                control={control}
                                render={({ field }) => (
                                    <InputWithCharacterLimit
                                        {...field}
                                        id="add-category-name"
                                        maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.name && <span className="error">{errors.name.message}</span>}
                        </div>
                        {isDuplicateName && (
                            <HintBox
                                title={PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError()}
                            />
                        )}
                        {error && <div className="error-container">{error}</div>}
                    </form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        type="submit"
                        form="add-program-category-form"
                        buttonStyle="primary"
                        className="w-100"
                        disabled={isSubmitting || isDuplicateName || !nameValue.trim()}
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

export default AddCategoryModal;
