import { useEffect, useState } from 'react';
import { Button } from '../../../../../../components/admin/button/Button';
import { Input } from '../../input/Input';
import './SupportOptionItem.scss';
import { SupportOptionsType } from '../../../../../../types/admin/donate';
import { ConfirmationModal } from '../../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { DONATE_TEXT } from '../../../../../../const/admin/donate';
import { SUPPORT_OPTIONS_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/bank-details-schema/bank-details-schema';

export enum SupportOptionItemMode {
    Create = 'create',
    Edit = 'edit',
    View = 'view',
}

interface ModalConfig {
    title: string;
    onConfirm: () => void;
}

export interface SupportOptionItemProps {
    data?: SupportOptionsType;
    initialMode?: SupportOptionItemMode;
    onSave?: (item: SupportOptionsType) => void;
    onCancel?: () => void;
    onDelete?: (id: number) => void;
}

export const SupportOptionItem = ({ data, initialMode, onSave, onCancel, onDelete }: SupportOptionItemProps) => {
    const [mode, setMode] = useState<SupportOptionItemMode>(
        initialMode ?? (data ? SupportOptionItemMode.View : SupportOptionItemMode.Create),
    );
    const [name, setName] = useState(data?.name ?? '');
    const [value, setValue] = useState(data?.value ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
    const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

    useEffect(() => {
        setName(data?.name ?? '');
        setValue(data?.value ?? '');
        setErrors({});
    }, [data]);

    const hasEmptyFields = !name.trim() || !value.trim();

    const hasChanges = () => {
        return name !== (data?.name ?? '') || value !== (data?.value ?? '');
    };

    const validateField = (field: 'name' | 'value', val: string) => {
        const validator =
            field === 'name'
                ? SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateName
                : SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateValue;
        const error = validator(val);
        setErrors((prev) => ({ ...prev, [field]: error }));
        return error === undefined;
    };

    const validateAll = () => {
        const nameError = SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateName(name);
        const valueError = SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateValue(value);
        setErrors({ name: nameError, value: valueError });
        return !nameError && !valueError;
    };

    const handleSave = () => {
        if (hasEmptyFields || !validateAll()) return;
        setIsSubmitting(true);
        const newItem: SupportOptionsType = { id: data?.id ?? Date.now(), name, value };
        onSave?.(newItem);
        setMode(SupportOptionItemMode.View);
        setIsSubmitting(false);
    };

    const handleCancel = () => {
        if (hasChanges()) {
            setModalConfig({
                title:
                    mode === SupportOptionItemMode.Edit
                        ? COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE
                        : DONATE_TEXT.QUESTION.CANCEL_EDIT,
                onConfirm: resetForm,
            });
        } else {
            resetForm();
        }
    };

    const resetForm = () => {
        setName(data?.name ?? '');
        setValue(data?.value ?? '');
        setErrors({});
        if (mode === SupportOptionItemMode.Create) onCancel?.();
        else setMode(SupportOptionItemMode.View);
    };

    const handleDelete = () => {
        if (!data?.id || !onDelete) return;
        onDelete(data.id);
    };

    const handleDeleteClick = () => {
        setIsDeleting(true);
        setModalConfig({
            title: DONATE_TEXT.QUESTION.SUPPORT_OPTION.DELETE,
            onConfirm: () => {
                handleDelete();
                setIsDeleting(false);
            },
        });
    };

    const handleSaveClick = () => {
        if (mode === SupportOptionItemMode.Edit) {
            handleSave();
        } else {
            setModalConfig({
                title: DONATE_TEXT.QUESTION.SUPPORT_OPTION.ADD,
                onConfirm: handleSave,
            });
        }
    };

    const handleModalCancelOrClose = () => {
        setModalConfig(null);
        setIsDeleting(false);
    };

    const editable = mode !== SupportOptionItemMode.View;

    const hasErrors = !!errors.name || !!errors.value;

    return (
        <div className="support-option">
            <div className={`support-option-header ${editable ? 'editable' : ''}`}>
                {mode === SupportOptionItemMode.View && <div className="support-option-header-title">{data?.name}</div>}
                {mode !== SupportOptionItemMode.Create && (
                    <div className="support-option-header-actions">
                        <button
                            aria-label="edit-btn"
                            className={`edit-btn ${editable ? 'edit' : ''}`}
                            onClick={() => setMode(SupportOptionItemMode.Edit)}
                        />
                        <button
                            aria-label="delete-btn"
                            className={`delete-btn delete-btn-icon ${isDeleting ? 'pressed' : ''}`}
                            onClick={handleDeleteClick}
                        />
                    </div>
                )}
            </div>

            <div className="support-option-fields">
                {mode !== SupportOptionItemMode.View && (
                    <div className="support-option-field">
                        <Input
                            name="name"
                            isTitle={true}
                            value={name}
                            editable={editable}
                            handleChange={(e) => setName(e.target.value)}
                            handleBlur={() => validateField('name', name)}
                            isRequired={true}
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                )}
                <div className="support-option-field">
                    <Input
                        name="value"
                        isTitle={true}
                        placeholder={DONATE_TEXT.PLACEHOLDER.SUPPORT_OPTION}
                        value={value}
                        editable={editable}
                        handleChange={(e) => setValue(e.target.value)}
                        handleBlur={() => validateField('value', value)}
                        isRequired={true}
                    />
                    {errors.value && <span className="error">{errors.value}</span>}
                </div>
            </div>

            {editable && (
                <div className="support-option-actions">
                    <Button type="button" onClick={handleCancel} buttonStyle="secondary">
                        {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                    </Button>
                    <Button
                        type="button"
                        aria-label="save-support-option"
                        onClick={handleSaveClick}
                        buttonStyle="primary"
                        disabled={isSubmitting || hasEmptyFields || !hasChanges() || hasErrors}
                    >
                        {DONATE_TEXT.BUTTON.PUBLISH}
                    </Button>
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
        </div>
    );
};
