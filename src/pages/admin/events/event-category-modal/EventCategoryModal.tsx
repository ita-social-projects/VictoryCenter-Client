import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { ModalMode } from '@/types/admin/common';
import { EventCategory } from '@/types/admin/event-category';
import { Modal } from '@/components/common/modal/Modal';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import './EventCategoryModal.scss';
import { EVENT_CATEGORY_VALIDATION_FUNCTIONS } from '@/validation/admin/event-category-schema/event-category-schema';
import { EVENT_CATEGORY_TEXT, EVENT_CATEGORY_VALIDATION, EVENT_NOTIFICATION_TIMERS } from '@/const/admin/events';
import { EventCategoriesApi } from '../event-categories/event-categories-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';

interface EventCategoryFormValues {
    name: string;
}

interface FormErrorState {
    name?: string;
}

interface BaseProps {
    isOpen: boolean;
    onClose: () => void;
    categories: EventCategory[];
}

interface AddModalProps extends BaseProps {
    mode: ModalMode.Add;
    onAddCategory: (category: EventCategory) => void;
}

interface EditModalProps extends BaseProps {
    mode: ModalMode.Edit;
    onUpdateCategory: (category: EventCategory) => void;
}

export type EventCategoryModalProps = AddModalProps | EditModalProps;

export const EventCategoryModal = (props: EventCategoryModalProps) => {
    const { isOpen, onClose, categories, mode } = props;
    const client = useAdminClient();

    const defaultFormState = useMemo<EventCategoryFormValues>(
        () => ({
            name: '',
        }),
        [],
    );

    const [formState, setFormState] = useState<EventCategoryFormValues>(defaultFormState);
    const [errors, setErrors] = useState<FormErrorState>({});
    const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [initialFormState, setInitialFormState] = useState<EventCategoryFormValues>(defaultFormState);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isDirty = JSON.stringify(formState) !== JSON.stringify(initialFormState);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
            ...prev,
            name: e.target.value,
        }));
        setErrors({});
    }, []);

    const handleCategoryChange = useCallback(
        (category: EventCategory) => {
            const selected = categories.find((cat) => cat.id === category.id);

            if (selected) {
                setSelectedCategory(selected);

                const nextFormState = { name: selected.name };
                setFormState(nextFormState);
                setInitialFormState(nextFormState);
                setErrors({});
            }
        },
        [categories],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setSelectedCategory(null);
        setFormState(defaultFormState);
        setInitialFormState(defaultFormState);
        setErrors({});
        setError('');
    }, [isOpen, defaultFormState]);

    const handleClose = useCallback(() => {
        if (isSubmitting) {
            return;
        }

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

    const handleCloseConfirmModalClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    const isDuplicateName = categories.some((category: EventCategory) => {
        if (mode === ModalMode.Edit) {
            return (
                category.id !== selectedCategory?.id &&
                category.name.trim().toLowerCase() === formState.name.trim().toLowerCase()
            );
        }
        return category.name.trim().toLowerCase() === formState.name.trim().toLowerCase();
    });

    const handleNameBlur = useCallback(() => {
        const validationError = EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);

        const error =
            validationError ??
            (isDuplicateName
                ? COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.ALREADY_CONTAIN_CATEGORY_WITH_NAME
                : undefined);

        setErrors((prev) => ({ ...prev, name: error }));
    }, [formState.name, isDuplicateName]);

    const isSubmitDisabled = () => {
        const nameValidationError = EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
        const hasValidationErrors = nameValidationError !== undefined || isDuplicateName;
        const hasEmptyFields = !formState.name.trim();

        if (mode === ModalMode.Edit) {
            const hasNoSelectedCategory = !selectedCategory;

            const noChanges = !!selectedCategory && formState.name.trim() === selectedCategory.name.trim();

            return hasValidationErrors || hasEmptyFields || hasNoSelectedCategory || noChanges;
        }

        return hasValidationErrors || hasEmptyFields;
    };

    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onSubmit = useCallback(
        async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            setIsSubmitting(true);
            setError('');
            setShowSaveConfirmModal(false);

            try {
                if (mode === ModalMode.Add) {
                    const newCategory = await EventCategoriesApi.create(client, {
                        name: formState.name.trim(),
                    });
                    props.onAddCategory(newCategory);
                } else {
                    const categoryData: EventCategory = {
                        id: selectedCategory!.id,
                        name: formState.name.trim(),
                    };

                    const updatedCategory = await EventCategoriesApi.update(client, categoryData);
                    props.onUpdateCategory(updatedCategory);
                }

                onClose();
            } catch {
                const errorMessage =
                    mode === ModalMode.Add
                        ? COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY
                        : COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY;
                setError(errorMessage);

                if (errorTimeoutRef.current) {
                    clearTimeout(errorTimeoutRef.current);
                }

                errorTimeoutRef.current = setTimeout(() => setError(''), EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formState, selectedCategory, mode, props, onClose, client],
    );

    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmitClick = useCallback(() => {
        if (isDuplicateName || isSubmitting) {
            return;
        }
        if (mode === ModalMode.Edit && !selectedCategory) {
            return;
        }

        const nameValidationError = EVENT_CATEGORY_VALIDATION_FUNCTIONS.validateName(formState.name);
        setErrors((prev) => ({ ...prev, name: nameValidationError }));

        if (nameValidationError !== undefined) {
            return;
        }

        if (mode === ModalMode.Edit) {
            setShowSaveConfirmModal(true);
        } else {
            onSubmit();
        }
    }, [onSubmit, formState, isSubmitting, isDuplicateName, selectedCategory, mode]);

    const handleSaveConfirmModalClose = useCallback(() => {
        setShowSaveConfirmModal(false);
    }, []);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>
                    {mode === ModalMode.Add
                        ? COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.ADD_CATEGORY
                        : COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.EDIT_CATEGORY}
                </Modal.Title>

                <Modal.Content>
                    <form onSubmit={(e) => e.preventDefault()} className="event-category-modal-form">
                        {mode === ModalMode.Edit && (
                            <SingleSelectInputGroup
                                id="edit-event-category-select"
                                label={EVENT_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                                isRequired
                                options={categories}
                                getOptionId={(category) => category.id}
                                getOptionName={(category) => category.name}
                                onChange={handleCategoryChange}
                                placeholder={EVENT_CATEGORY_TEXT.FORM.SELECT_CATEGORY_PLACEHOLDER}
                                value={selectedCategory || undefined}
                            />
                        )}

                        <InputWithCharacterLimitGroup
                            isRequired
                            label={EVENT_CATEGORY_TEXT.FORM.LABEL.NAME}
                            error={errors.name}
                            value={formState.name}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            name="name"
                            type="text"
                            id="event-category-name"
                            maxLength={EVENT_CATEGORY_VALIDATION.name.max}
                            placeholder={EVENT_CATEGORY_TEXT.FORM.NAME_PLACEHOLDER}
                        />

                        {error && (
                            <div className="event-category-modal-error-container" role="alertГ">
                                {error}
                            </div>
                        )}
                    </form>
                </Modal.Content>

                <Modal.Actions>
                    <Button
                        type="button"
                        buttonStyle="primary"
                        disabled={isSubmitDisabled()}
                        className="event-category-modal-save-button"
                        onClick={handleSubmitClick}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE}
                    </Button>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onClose={handleCloseConfirmModalClose}
                onCancel={handleCloseConfirmModalClose}
                onConfirm={handleConfirmClose}
            />

            <ConfirmationModal
                isOpen={showSaveConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES}
                onClose={handleSaveConfirmModalClose}
                onCancel={handleSaveConfirmModalClose}
                onConfirm={onSubmit}
            />
        </>
    );
};
