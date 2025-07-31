import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/common/button/Button';
import { HintBox } from '../../../../../components/common/hint-box/HintBox';
import { InputWithCharacterLimit } from '../../../../../components/common/input-with-character-limit/InputWithCharacterLimit';
import { QuestionModal } from '../../../../../components/common/question-modal/QuestionModal';
import { ProgramCategory, ProgramCategoryCreateUpdate } from '../../../../../types/admin/Programs';
import { PROGRAM_CATEGORY_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/program-category-schema/program-category-schema';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './program-category-modal.scss';

interface ProgramCategoryFormValues {
    name: string;
}

interface FormErrorState {
    name?: string;
}

interface BaseProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ProgramCategory[];
}

interface AddModalProps extends BaseProps {
    mode: 'add';
    onAddCategory: (category: ProgramCategory) => void;
}

interface EditModalProps extends BaseProps {
    mode: 'edit';
    onEditCategory: (category: ProgramCategory) => void;
}

export type ProgramCategoryModalProps = AddModalProps | EditModalProps;

const validateForm = (formState: ProgramCategoryFormValues): FormErrorState => {
    return {
        name: PROGRAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name),
    };
};

const hasErrors = (errors: FormErrorState): boolean => {
    return Object.values(errors).some((error) => error !== undefined);
};

export const ProgramCategoryModal = (props: ProgramCategoryModalProps) => {
    const { isOpen, onClose, categories, mode } = props;

    const defaultFormState = useMemo<ProgramCategoryFormValues>(
        () => ({
            name: '',
        }),
        [],
    );

    const [formState, setFormState] = useState<ProgramCategoryFormValues>(defaultFormState);
    const [errors, setErrors] = useState<FormErrorState>({});
    const [initialFormState, setInitialFormState] = useState<ProgramCategoryFormValues>(defaultFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [error, setError] = useState('');

    const selectedCategoryRef = useRef<null | ProgramCategory>(null);

    const reset = useCallback(
        (data?: ProgramCategoryFormValues) => {
            const newState = data || defaultFormState;
            setFormState(newState);
            setInitialFormState(newState);
            setErrors({});
        },
        [defaultFormState],
    );

    const isDirty = JSON.stringify(formState) !== JSON.stringify(initialFormState);

    const isDuplicateName = categories.some((category) => {
        if (mode === 'edit') {
            return (
                category.id !== selectedCategoryRef.current?.id &&
                category.name.trim().toLowerCase() === formState.name.trim().toLowerCase()
            );
        }
        return category.name.trim().toLowerCase() === formState.name.trim().toLowerCase();
    });

    // Name handler
    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormState((prev) => ({ ...prev, name: value }));
    }, []);

    const handleNameBlur = useCallback(() => {
        const error = PROGRAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
        setErrors((prev) => ({ ...prev, name: error }));
    }, [formState.name]);

    const onSubmit = useCallback(
        async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            if (isSubmitting || isDuplicateName) return;
            if (mode === 'edit' && !selectedCategoryRef.current) return;

            setIsSubmitting(true);
            setError('');
            setShowSaveConfirmModal(false);

            try {
                const categoryData: ProgramCategoryCreateUpdate = {
                    id: mode === 'edit' ? selectedCategoryRef.current!.id : null,
                    name: formState.name.trim(),
                };

                if (mode === 'add') {
                    const newCategory = await ProgramsApi.addProgramCategory(categoryData);
                    props.onAddCategory(newCategory);
                } else {
                    const updatedCategory = await ProgramsApi.editProgramCategory(categoryData);
                    props.onEditCategory(updatedCategory);
                }

                onClose();
            } catch {
                const errorMessage =
                    mode === 'add'
                        ? PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY
                        : PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY;
                setError(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formState, isSubmitting, isDuplicateName, mode, props, onClose],
    );

    const handleSubmitClick = useCallback(() => {
        if (isSubmitting || isDuplicateName) return;
        if (mode === 'edit' && !selectedCategoryRef.current) return;

        const formErrors = validateForm(formState);
        setErrors(formErrors);

        if (hasErrors(formErrors)) {
            return;
        }

        if (mode === 'edit') {
            setShowSaveConfirmModal(true);
        } else {
            onSubmit();
        }
    }, [onSubmit, formState, isSubmitting, isDuplicateName, mode]);

    const handleClose = useCallback(() => {
        if (isSubmitting) return;

        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        onClose();
    }, [isSubmitting, isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);

    const handleCategoryChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedId = parseInt(e.target.value);
            const selected = categories.find((cat) => cat.id === selectedId);
            if (selected) {
                selectedCategoryRef.current = selected;
                reset({ name: selected.name });
            } else {
                selectedCategoryRef.current = null;
                reset({ name: '' });
            }
        },
        [categories, reset],
    );

    // Reset form on open
    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen, categories, reset, mode]);

    const isSubmitDisabled = () => {
        const currentValidationError = PROGRAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
        const hasValidationErrors = currentValidationError !== undefined || isDuplicateName;
        const hasEmptyName = !formState.name.trim();

        if (mode === 'edit') {
            const hasNoSelectedCategory = !selectedCategoryRef.current;
            const nameNotChanged =
                !!selectedCategoryRef.current && formState.name.trim() === selectedCategoryRef.current.name.trim();

            return isSubmitting || hasValidationErrors || hasEmptyName || hasNoSelectedCategory || nameNotChanged;
        }

        return isSubmitting || hasValidationErrors || hasEmptyName;
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
                    <form onSubmit={(e) => e.preventDefault()} className="program-form-main" id={getFormId()}>
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
                                {mode === 'add' ? (
                                    <>
                                        <span className="required-field">*</span>
                                        {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                                    </>
                                ) : (
                                    PROGRAM_CATEGORY_TEXT.FORM.LABEL.EDIT_NAME
                                )}
                            </label>
                            <InputWithCharacterLimit
                                value={formState.name}
                                onChange={handleNameChange}
                                onBlur={handleNameBlur}
                                id={getFieldId('name')}
                                name="name"
                                maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                                disabled={isSubmitting}
                            />
                            {errors.name && <span className="error">{errors.name}</span>}
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
                        type="button"
                        onClick={handleSubmitClick}
                        buttonStyle="primary"
                        className="w-100"
                        disabled={isSubmitDisabled()}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE}
                    </Button>
                </Modal.Actions>
            </Modal>

            {/* Save confirmation */}
            <QuestionModal
                isOpen={showSaveConfirmModal}
                isSubmitting={false}
                title={COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onClose={() => setShowSaveConfirmModal(false)}
                onCancel={() => setShowSaveConfirmModal(false)}
                onConfirm={() => onSubmit()}
            />

            {/* CLose confirmation */}
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
