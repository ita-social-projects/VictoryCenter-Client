import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Button } from '../../../../../components/admin/button/Button';
import { Input } from '../input/Input';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import './GenericForm.scss';
import { FieldValues } from 'react-hook-form';
import { DONATE_TEXT } from '../../../../../const/admin/donate';

interface ModalConfig {
    title: string;
    onConfirm: () => void;
}

export interface GenericFormRef {
    submit: () => Promise<void>;
    isChanged: () => boolean;
    isValid: (isPublishing?: boolean) => boolean;
}

export interface GenericFormProps<T extends FieldValues> {
    isOpen?: boolean;
    initialData?: T;
    initialMode: GenericFormMode;
    onSubmit: (data: T) => void;
    onClose: () => void;
    onDelete?: (id: number) => void;
    isChildForm?: boolean;
    children?: (form: { formState: T; isItemsExpanded: boolean }) => React.ReactNode;
    onModeChange?: (mode: GenericFormMode) => void;
}

export enum GenericFormMode {
    Create = 'create',
    Edit = 'edit',
    View = 'view',
}

export interface GenericFormField<T extends Record<string, any>> {
    name: keyof T;
    label?: string;
    placeholder?: string;
    prefix?: string;
    isTitle?: boolean;
    isRequired?: boolean;
    onlyNumbers?: boolean;
    maxLength?: number;
    validate?: (value: T[keyof T], isPublishing?: boolean) => string | undefined;
}

export function createGenericForm<T extends { id?: number }>(fields: GenericFormField<T>[]) {
    type Props = GenericFormProps<T>;
    type Ref = GenericFormRef;

    return forwardRef<Ref, Props>(
        (
            {
                isOpen = true,
                initialData = null,
                initialMode = GenericFormMode.View,
                onClose,
                onSubmit,
                onDelete,
                isChildForm = false,
                children,
                onModeChange,
            },
            ref,
        ) => {
            type FormState = T;

            const [formState, setFormState] = useState<FormState>(initialData ?? ({} as FormState));
            const [initialFormState, setInitialFormState] = useState<FormState>(initialData ?? ({} as FormState));
            const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
            const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());
            const [isSubmitting, setIsSubmitting] = useState(false);
            const [mode, setMode] = useState<GenericFormMode>(initialMode);
            const [isExpanded, setIsExpanded] = useState(mode !== GenericFormMode.View);
            const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
            const [isDeleting, setIsDeleting] = useState(false);

            const isItemsExpanded = true;

            const editable = mode !== GenericFormMode.View;

            const titleField = useMemo(() => fields.find((f) => f.isTitle), []);
            const titleFieldName = titleField?.name;

            useEffect(() => {
                onModeChange?.(mode);
            }, [mode, onModeChange]);

            useEffect(() => {
                const newState: FormState = { ...(initialData ?? ({} as FormState)) };
                setFormState(newState);
                setInitialFormState(newState);
                setErrors({});
                setTouchedFields(new Set());
            }, [initialData]);

            const isChanged = useCallback(
                () => JSON.stringify(formState) !== JSON.stringify(initialFormState),
                [formState, initialFormState],
            );

            const isValid = useCallback(
                (isPublishing = false) => {
                    const newErrors: Partial<Record<keyof T, string>> = {};
                    fields.forEach((f) => {
                        if (f.validate) {
                            newErrors[f.name] = f.validate(formState[f.name], isPublishing);
                        }
                    });
                    setErrors(newErrors);
                    return !Object.values(newErrors).some((e) => e !== undefined);
                },
                [formState],
            );

            const submit = useCallback(async () => {
                if (isSubmitting || !onSubmit) return;
                setIsSubmitting(true);
                try {
                    const submitData = { ...initialData, ...formState } as T;
                    await onSubmit(submitData);
                    setInitialFormState(formState);
                    if (mode === GenericFormMode.Edit) setMode(GenericFormMode.View);
                } finally {
                    setIsSubmitting(false);
                }
            }, [formState, onSubmit, isSubmitting, mode, initialData]);

            useImperativeHandle(ref, () => ({
                submit,
                isChanged,
                isValid,
            }));

            const handleValueChange = useCallback(
                (field: keyof T, value: string) => {
                    setFormState((prev) => ({ ...prev, [field]: value as any }));

                    setTouchedFields((prev) => new Set(prev).add(field));

                    const validator = fields.find((f) => f.name === field)?.validate;
                    if (validator) {
                        const error = validator(value as any);
                        setErrors((prev) => ({ ...prev, [field]: error }));
                    }
                },
                // eslint-disable-next-line react-hooks/exhaustive-deps
                [fields],
            );

            const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (mode === GenericFormMode.Edit) return;
                setMode((prev) => (prev === GenericFormMode.View ? GenericFormMode.Edit : GenericFormMode.View));
                setIsExpanded(true);
            };

            const handleCreateCancel = () => {
                if (isChanged()) {
                    setModalConfig({
                        title: DONATE_TEXT.QUESTION.BANK_DETAILS.CANCEL_CREATE,
                        onConfirm: () => onClose?.(),
                    });
                } else {
                    onClose?.();
                }
            };

            const handleEditCancel = () => {
                if (isChanged()) {
                    setModalConfig({
                        title: COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE,
                        onConfirm: () => {
                            setFormState(initialFormState);
                            setErrors({});
                            setTouchedFields(new Set());
                            setMode(GenericFormMode.View);
                        },
                    });
                } else {
                    setFormState(initialFormState);
                    setErrors({});
                    setTouchedFields(new Set());
                    setMode(GenericFormMode.View);
                }
            };

            const handleViewCancel = () => {
                setIsExpanded(false);
            };

            const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (mode === GenericFormMode.Create) return handleCreateCancel();
                if (mode === GenericFormMode.Edit) return handleEditCancel();
                return handleViewCancel();
            };

            const handleModalCancelOrClose = () => {
                setModalConfig(null);
                setIsDeleting(false);
            };

            const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (mode === GenericFormMode.Create) {
                    onClose?.();
                    return;
                }

                setIsDeleting(true);
                let deleteTitle;

                if (isChildForm) {
                    deleteTitle = DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE;
                } else if (
                    'correspondentBanks' in formState &&
                    Array.isArray(formState.correspondentBanks) &&
                    formState.correspondentBanks.length > 0
                ) {
                    deleteTitle = DONATE_TEXT.QUESTION.BANK_DETAILS.FOREIGN.DELETE;
                } else {
                    deleteTitle = DONATE_TEXT.QUESTION.BANK_DETAILS.DELETE;
                }

                setModalConfig({
                    title: deleteTitle,
                    onConfirm: async () => {
                        await handleDelete();
                        setIsDeleting(false);
                    },
                });
            };

            const handleDelete = async () => {
                if (!initialData?.id || !onDelete) {
                    return;
                }
                try {
                    await onDelete(initialData.id);
                    onClose?.();
                } finally {
                    handleModalCancelOrClose();
                }
            };

            const hasEmptyRequiredFields = useMemo(() => {
                return fields.some((f) => {
                    if (!f.isRequired) return false;
                    const value = formState[f.name];
                    if (Array.isArray(value)) return value.length === 0;
                    return !String(value ?? '').trim();
                });
            }, [formState]);

            if (!isOpen) return null;

            return (
                <div
                    className={`generic-form ${mode} ${isChildForm ? 'child' : ''}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                        }
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {mode !== GenericFormMode.Create && (
                        <div className="form-head-container">
                            {!isChildForm && (
                                <div className="form-header">
                                    <button
                                        className={`edit-btn ${mode}`}
                                        aria-label="edit-btn"
                                        onClick={handleEditClick}
                                        disabled={mode === GenericFormMode.Edit}
                                    />
                                    <button
                                        className={`delete-btn ${mode}`}
                                        aria-label="delete-btn"
                                        onClick={handleDeleteClick}
                                    ></button>
                                </div>
                            )}

                            {mode === GenericFormMode.View && (
                                <>
                                    <div
                                        className="form-name"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setIsExpanded((prev) => !prev);
                                            }
                                        }}
                                        onClick={() => setIsExpanded((prev) => !prev)}
                                    >
                                        {titleFieldName ? String(formState[titleFieldName] ?? '') : ''}
                                        <span className={`arrow ${isExpanded ? 'expanded' : ''}`}></span>
                                    </div>
                                    {isChildForm && (
                                        <div className="form-name-actions">
                                            <button
                                                className={`edit-btn ${mode}`}
                                                aria-label="edit-btn"
                                                type="button"
                                                onClick={handleEditClick}
                                            ></button>
                                            <button
                                                className={`delete-btn delete-btn-icon ${mode} ${isDeleting ? 'pressed' : ''}`}
                                                aria-label="delete-btn"
                                                type="button"
                                                onClick={handleDeleteClick}
                                            ></button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {isExpanded && (
                        <div className="form-body">
                            {fields
                                .filter((f) => {
                                    if (mode === GenericFormMode.View) {
                                        if (f.isTitle) return false;
                                        const value = formState[f.name];
                                        if (Array.isArray(value)) return value.length > 0;
                                        return Boolean(String(value ?? '').trim());
                                    }
                                    return true;
                                })
                                .map((f) => {
                                    const isTitleField = f.isTitle;

                                    return (
                                        <div
                                            key={String(f.name)}
                                            className={`form-field ${isTitleField ? 'form-field-title-row' : ''}`}
                                        >
                                            <div className="form-field-content">
                                                <Input
                                                    name={String(f.name)}
                                                    label={f.label}
                                                    isRequired={mode === GenericFormMode.Create && f.isRequired}
                                                    isTitle={f.isTitle}
                                                    placeholder={f.placeholder}
                                                    prefix={f.prefix}
                                                    value={String(formState[f.name] ?? '')}
                                                    editable={editable}
                                                    onValueChange={(cleanValue) =>
                                                        handleValueChange(f.name, cleanValue)
                                                    }
                                                    onlyNumbers={f.onlyNumbers}
                                                />
                                                {touchedFields.has(f.name) && errors[f.name] && (
                                                    <span className="error">{errors[f.name]}</span>
                                                )}
                                            </div>

                                            {isChildForm && isTitleField && mode === GenericFormMode.Edit && (
                                                <div className={`title-actions`}>
                                                    <button
                                                        type="button"
                                                        aria-label="edit-btn"
                                                        className={`edit-btn ${mode}`}
                                                        onClick={handleEditClick}
                                                        disabled
                                                    />
                                                    <button
                                                        type="button"
                                                        aria-label="delete-btn"
                                                        className={`delete-btn delete-btn-icon ${isDeleting ? 'pressed' : ''}`}
                                                        onClick={handleDeleteClick}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                            {editable && (
                                <div className="form-footer">
                                    <div className="actions">
                                        <Button type="button" onClick={handleCancel} buttonStyle="secondary">
                                            {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={
                                                mode === GenericFormMode.Edit
                                                    ? () =>
                                                          setModalConfig({
                                                              title: DONATE_TEXT.QUESTION.BANK_DETAILS.UPDATE,
                                                              onConfirm: submit,
                                                          })
                                                    : () =>
                                                          setModalConfig({
                                                              title: DONATE_TEXT.QUESTION.BANK_DETAILS.ADD,
                                                              onConfirm: submit,
                                                          })
                                            }
                                            buttonStyle="primary"
                                            disabled={isSubmitting || hasEmptyRequiredFields || !isChanged()}
                                        >
                                            {DONATE_TEXT.BUTTON.PUBLISH}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <ConfirmationModal
                        isOpen={!!modalConfig}
                        isButtonsDisabled={false}
                        title={modalConfig?.title ?? ''}
                        onConfirm={() => {
                            modalConfig?.onConfirm();
                            setModalConfig(null);
                        }}
                        onCancel={handleModalCancelOrClose}
                        onClose={handleModalCancelOrClose}
                        confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                        cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                    />

                    {!isChildForm && <>{children && children({ formState, isItemsExpanded })}</>}
                </div>
            );
        },
    );
}
