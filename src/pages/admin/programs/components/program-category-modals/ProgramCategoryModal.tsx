import './ProgramCategoryModal.scss';
import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/common/button/Button';
import { HintBox } from '../../../../../components/common/hint-box/HintBox';
import { InputWithCharacterLimit } from '../../../../../components/common/input-with-character-limit/InputWithCharacterLimit';
import { QuestionModal } from '../../../../../components/common/question-modal/QuestionModal';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ProgramCategoryValidationSchema } from '../../../../../validation/admin/program-category-schema/program-category-schema';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ProgramCategory, ProgramCategoryCreateUpdate } from '../../../../../types/admin/programs';

type ProgramCategoryFormValues = {
    name: string;
};

type BaseProps = {
    isOpen: boolean;
    onClose: () => void;
    categories: ProgramCategory[];
};

type AddModalProps = {
    mode: 'add';
    onAddCategory: (category: ProgramCategory) => void;
};

type EditModalProps = {
    mode: 'edit';
    onEditCategory: (category: ProgramCategory) => void;
};

export type ProgramCategoryModalProps = BaseProps & (AddModalProps | EditModalProps);

export const ProgramCategoryModal = (props: ProgramCategoryModalProps) => {
    const { isOpen, onClose, categories, mode } = props;

    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const selectedCategoryRef = useRef<null | ProgramCategory>(null);
    const [error, setError] = useState('');

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProgramCategoryFormValues>({
        mode: 'onBlur',
        resolver: yupResolver(ProgramCategoryValidationSchema),
        defaultValues: {
            name: '',
        },
    });

    const nameValue = watch('name') || '';

    const isDuplicateName = categories.some((category) => {
        if (mode === 'edit') {
            return (
                category.id !== selectedCategoryRef.current?.id &&
                category.name.trim().toLowerCase() === nameValue.trim().toLowerCase()
            );
        }
        return category.name.trim().toLowerCase() === nameValue.trim().toLowerCase();
    });

    const onSubmit = async (data: ProgramCategoryFormValues) => {
        if (isSubmitting || isDuplicateName) return;

        if (mode === 'edit' && !selectedCategoryRef.current) return;

        setError('');

        try {
            const categoryData: ProgramCategoryCreateUpdate = {
                id: mode === 'edit' ? selectedCategoryRef.current!.id : null,
                name: data.name.trim(),
            };

            if (mode === 'add') {
                const newCategory = await ProgramsApi.addProgramCategory(categoryData);
                props.onAddCategory(newCategory);
            } else {
                const updatedCategory = await ProgramsApi.editCategory(categoryData);
                props.onEditCategory(updatedCategory);
            }

            onClose();
        } catch {
            const errorMessage =
                mode === 'add'
                    ? PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY
                    : PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY;
            setError(errorMessage);
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

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selected = categories.find((cat) => cat.id === selectedId);
        if (selected) {
            selectedCategoryRef.current = selected;
            reset({ name: selected.name });
        } else {
            selectedCategoryRef.current = null;
            reset({ name: '' });
        }
    };

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit') {
                if (categories.length > 0) {
                    const firstCategory = categories[0];
                    selectedCategoryRef.current = firstCategory;
                    reset({ name: firstCategory.name });
                } else {
                    selectedCategoryRef.current = null;
                    reset({ name: '' });
                }
            } else {
                reset({ name: '' });
            }
            setError('');
        }
    }, [isOpen, categories, reset, mode]);

    const isSubmitDisabled = () => {
        const baseConditions = isSubmitting || isDuplicateName || !nameValue.trim();

        if (mode === 'edit') {
            return baseConditions || !isDirty;
        }

        return baseConditions;
    };

    const getTitle = () => {
        return mode === 'add'
            ? PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY
            : PROGRAM_CATEGORY_TEXT.FORM.TITLE.EDIT_CATEGORY;
    };

    const getFormId = () => {
        return mode === 'add' ? 'add-program-category-form' : 'edit-program-category-form';
    };

    const getFieldId = (field: string) => {
        return mode === 'add' ? `add-category-${field}` : `edit-category-${field}`;
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{getTitle()}</Modal.Title>
                <Modal.Content>
                    <form onSubmit={handleSubmit(onSubmit)} className="program-form-main" id={getFormId()}>
                        {mode === 'edit' && (
                            <div className="form-group">
                                <label htmlFor={getFieldId('select')}>
                                    <span className="required-field">*</span>
                                    {PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                                </label>
                                <select
                                    id={getFieldId('select')}
                                    data-testid="category-select"
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
                        )}

                        <div className="form-group form-group-name">
                            <label htmlFor={getFieldId('name')}>
                                <span className="required-field">*</span>
                                {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                            </label>
                            <Controller
                                name={'name'}
                                control={control}
                                render={({ field }) => (
                                    <InputWithCharacterLimit
                                        {...field}
                                        id={getFieldId('name')}
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
                        form={getFormId()}
                        buttonStyle="primary"
                        className="w-100"
                        disabled={isSubmitDisabled()}
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

export default ProgramCategoryModal;
