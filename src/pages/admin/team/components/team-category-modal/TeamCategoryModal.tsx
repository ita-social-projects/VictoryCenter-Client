import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/admin/button/Button';
import { HintBox } from '../../../../../components/admin/hint-box/HintBox';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { SingleSelectInputGroup } from '../../../../../components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { TeamCategory } from '../../../../../types/admin/team-category';
import { TEAM_CATEGORY_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/team-category-schema/team-category-schema';
import { TEAM_CATEGORY_TEXT, TEAM_CATEGORY_VALIDATION, TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-categories/team-categories-api';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './TeamCategoryModal.scss';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TextAreaWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { ModalMode } from '../../../../../types/admin/common';

interface TeamCategoryFormValues {
    name: string;
    description: string;
}

interface FormErrorState {
    name?: string;
    description?: string;
}

interface BaseProps {
    isOpen: boolean;
    onClose: () => void;
    categories: TeamCategory[];
}

interface AddModalProps extends BaseProps {
    mode: ModalMode.Add;
    onAddCategory: (category: TeamCategory) => void;
}

interface EditModalProps extends BaseProps {
    mode: ModalMode.Edit;
    onEditCategory: (category: TeamCategory) => void;
}

export type TeamCategoryModalProps = AddModalProps | EditModalProps;

const validateForm = (formState: TeamCategoryFormValues): FormErrorState => {
    return {
        name: TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name),
        description: TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(formState.description),
    };
};

const hasErrors = (errors: FormErrorState): boolean => {
    return Object.values(errors).some((error) => error !== undefined);
};

export const TeamCategoryModal = (props: TeamCategoryModalProps) => {
    const { isOpen, onClose, categories, mode } = props;
    const client = useAdminClient();

    const defaultFormState = useMemo<TeamCategoryFormValues>(
        () => ({
            name: '',
            description: '',
        }),
        [],
    );

    const [formState, setFormState] = useState<TeamCategoryFormValues>(defaultFormState);
    const [errors, setErrors] = useState<FormErrorState>({});
    const [initialFormState, setInitialFormState] = useState<TeamCategoryFormValues>(defaultFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [error, setError] = useState('');

    const selectedCategoryRef = useRef<null | TeamCategory>(null);

    const reset = useCallback(
        (data?: TeamCategoryFormValues) => {
            const newState = data || defaultFormState;
            setFormState(newState);
            setInitialFormState(newState);
            setErrors({});
        },
        [defaultFormState],
    );

    const isDirty = JSON.stringify(formState) !== JSON.stringify(initialFormState);

    const isDuplicateName = categories.some((category: TeamCategory) => {
        if (mode === ModalMode.Edit) {
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
        setFormState((prev: TeamCategoryFormValues) => ({ ...prev, name: value }));
    }, []);

    const handleNameBlur = useCallback(() => {
        const error = TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
        setErrors((prev) => ({ ...prev, name: error }));
    }, [formState.name]);

    // Description handler
    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormState((prev: TeamCategoryFormValues) => ({ ...prev, description: value }));
    }, []);

    const handleDescriptionBlur = useCallback(() => {
        const error = TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(formState.description);
        setErrors((prev) => ({ ...prev, description: error }));
    }, [formState.description]);

    const onSubmit = useCallback(
        async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            if (isSubmitting || isDuplicateName) return;
            if (mode === ModalMode.Edit && !selectedCategoryRef.current) return;

            setIsSubmitting(true);
            setError('');
            setShowSaveConfirmModal(false);

            try {
                const categoryData = {
                    id: mode === ModalMode.Edit ? selectedCategoryRef.current!.id : null,
                    name: formState.name.trim(),
                    description: formState.description.trim(),
                };

                if (mode === ModalMode.Add) {
                    const newCategory = await TeamCategoriesApi.create(client, categoryData);
                    props.onAddCategory(newCategory);
                } else {
                    const updatedCategory = await TeamCategoriesApi.update(client, categoryData);
                    props.onEditCategory(updatedCategory);
                }

                onClose();
            } catch {
                const errorMessage =
                    mode === ModalMode.Add
                        ? TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_MEMBER
                        : TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_MEMBER;
                setError(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formState, isSubmitting, isDuplicateName, mode, props, onClose, client],
    );

    const handleSubmitClick = useCallback(() => {
        if (isSubmitting || isDuplicateName) return;
        if (mode === ModalMode.Edit && !selectedCategoryRef.current) return;

        const formErrors = validateForm(formState);
        setErrors(formErrors);

        if (hasErrors(formErrors)) {
            return;
        }

        if (mode === ModalMode.Edit) {
            setShowSaveConfirmModal(true);
        } else {
            onSubmit();
        }
    }, [onSubmit, formState, isSubmitting, isDuplicateName, mode]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);
    
    const handleClose = useCallback(() => {
        if (isSubmitting) return;

        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        onClose();
    }, [isSubmitting, isDirty, onClose]);

    const handleCategoryChange = useCallback(
        (category: TeamCategory) => {
            const selected = categories.find((cat) => cat.id === category.id);
            if (selected) {
                selectedCategoryRef.current = selected;
                reset({ name: selected.name, description: selected.description });
            } else {
                selectedCategoryRef.current = null;
                reset({ name: '', description: '' });
            }
        },
        [categories, reset],
    );

    // Reset form on open
    useEffect(() => {
        if (!isOpen) return;

        if (mode === ModalMode.Edit) {
            if (categories.length > 0) {
                const firstCategory = categories[0];
                selectedCategoryRef.current = firstCategory;
                reset({ name: firstCategory.name, description: firstCategory.description });
            } else {
                selectedCategoryRef.current = null;
                reset({ name: '', description: '' });
            }
        } else {
            reset({ name: '', description: '' });
        }
        setError('');
    }, [isOpen, categories, reset, mode]);

    const isSubmitDisabled = () => {
        const nameValidationError = TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
        const descriptionValidationError = TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(
            formState.description,
        );
        const hasValidationErrors =
            nameValidationError !== undefined || descriptionValidationError !== undefined || isDuplicateName;
        const hasEmptyFields = !formState.name.trim() || !formState.description.trim();

        if (mode === ModalMode.Edit) {
            const hasNoSelectedCategory = !selectedCategoryRef.current;
            const noChanges =
                !!selectedCategoryRef.current &&
                formState.name.trim() === selectedCategoryRef.current.name.trim() &&
                formState.description.trim() === selectedCategoryRef.current.description.trim();

            return isSubmitting || hasValidationErrors || hasEmptyFields || hasNoSelectedCategory || noChanges;
        }

        return isSubmitting || hasValidationErrors || hasEmptyFields;
    };

    const getTitle = () => {
        return mode === ModalMode.Add
            ? COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.ADD_CATEGORY
            : COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.EDIT_CATEGORY;
    };

    const getFormId = () => {
        return mode === ModalMode.Add ? 'add-program-category-form' : 'edit-program-category-form';
    };

    const getFieldId = (field: string) => {
        return mode === ModalMode.Add ? `add-category-${field}` : `edit-category-${field}`;
    };

    const handleSaveConfirmModalClose = useCallback(() => {
        setShowSaveConfirmModal(false);
    }, []);

    const handleCloseConfirmModalClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{getTitle()}</Modal.Title>
                <Modal.Content>
                    <form onSubmit={(e) => e.preventDefault()} className="program-form-main" id={getFormId()}>
                        {mode === ModalMode.Edit && (
                            <SingleSelectInputGroup
                                id={getFieldId('select')}
                                label={TEAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                                isRequired={true}
                                options={categories}
                                getOptionId={(c) => c.id}
                                getOptionName={(c) => c.name}
                                disabled={isSubmitting}
                                onChange={handleCategoryChange}
                                placeholder={''}
                                value={selectedCategoryRef.current || undefined}
                            />
                        )}

                        <InputWithCharacterLimitGroup
                            isRequired={true}
                            label={TEAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                            error={errors.name}
                            value={formState.name}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            name={'name'}
                            type={'text'}
                            id={getFieldId('name')}
                            maxLength={TEAM_CATEGORY_VALIDATION.name.max}
                            disabled={isSubmitting}
                        />

                        <TextAreaWithCharacterLimitGroup
                            isRequired={true}
                            label={TEAM_CATEGORY_TEXT.FORM.LABEL.DESCRIPTION}
                            error={errors.description}
                            value={formState.description}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            name={'description'}
                            id={getFieldId('description')}
                            maxLength={TEAM_CATEGORY_VALIDATION.description.max}
                            disabled={isSubmitting}
                        />

                        {isDuplicateName && <HintBox title={TEAM_CATEGORY_VALIDATION.name.getDuplicateNameError()} />}

                        {error && <div className="team-category-modal-error-container">{error}</div>}
                    </form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        type="button"
                        onClick={handleSubmitClick}
                        buttonStyle="primary"
                        className="team-category-modal-save-button"
                        disabled={isSubmitDisabled()}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE}
                    </Button>
                </Modal.Actions>
            </Modal>

            {/* Save confirmation */}
            <ConfirmationModal
                isOpen={showSaveConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onClose={handleSaveConfirmModalClose}
                onCancel={handleSaveConfirmModalClose}
                onConfirm={onSubmit}
            />

            {/* Close confirmation */}
            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onClose={handleCloseConfirmModalClose}
                onCancel={handleCloseConfirmModalClose}
                onConfirm={handleConfirmClose}
            />
        </>
    );
};
