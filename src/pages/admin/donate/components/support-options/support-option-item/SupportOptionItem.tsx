import { useEffect, useState } from 'react';
import { Button } from '../../../../../../components/admin/button/Button';
import { DonateInput } from '../../donate-input/DonateInput';
import './SupportOptionItem.scss';
import { SupportOptionsType } from '../../../../../../types/admin/donate';
import { ConfirmationModal } from '../../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { DONATE_TEXT, VALIDATION_PARAMS } from '../../../../../../const/admin/donate';
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
    onSave?: (name: string, value: string) => Promise<void>;
    onCancel?: () => void;
    onDelete?: () => Promise<void>;
    onModeChange?: (mode: SupportOptionItemMode) => void;
}

export const SupportOptionItem = ({
    data,
    initialMode,
    onSave,
    onCancel,
    onDelete,
    onModeChange,
}: SupportOptionItemProps) => {
    const [mode, setMode] = useState<SupportOptionItemMode>(
        initialMode ?? (data ? SupportOptionItemMode.View : SupportOptionItemMode.Create),
    );
    const [name, setName] = useState(data?.name ?? '');
    const [value, setValue] = useState(data?.value ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
    const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

    useEffect(() => {
        onModeChange?.(mode);
    }, [mode, onModeChange]);

    useEffect(() => {
        setName(data?.name ?? '');
        setValue(data?.value ?? '');
        setErrors({});
        setMode(initialMode ?? (data ? SupportOptionItemMode.View : SupportOptionItemMode.Create));
    }, [data, initialMode]);

    const isViewMode = mode === SupportOptionItemMode.View;
    const isCreateMode = mode === SupportOptionItemMode.Create;
    const editable = !isViewMode;
    const hasEmptyFields = !name.trim() || !value.trim();
    const hasChanges = name !== (data?.name ?? '') || value !== (data?.value ?? '');

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

    const handleSave = async () => {
        if (hasEmptyFields || !validateAll() || !onSave) return;

        setIsSubmitting(true);
        try {
            await onSave(name, value);
            setMode(SupportOptionItemMode.View);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            setModalConfig({
                title:
                    mode === SupportOptionItemMode.Edit
                        ? COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE
                        : DONATE_TEXT.QUESTION.SUPPORT_OPTION.CANCEL_CREATE,
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
        if (isCreateMode) onCancel?.();
        else setMode(SupportOptionItemMode.View);
    };

    const handleDelete = async () => {
        if (!onDelete) return;

        setIsSubmitting(true);
        try {
            await onDelete();
        } finally {
            setIsSubmitting(false);
        }
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

    const handleEditClick = () => {
        if (editable) return;
        setMode(SupportOptionItemMode.Edit);
    };

    const handleValueChange = (field: 'name' | 'value', val: string) => {
        let setter = field === 'name' ? setName : setValue;
        setter(val);

        validateField(field, val);
    };

    return (
        <div className="support-option">
            <div className={`support-option-header ${editable ? 'editable' : ''}`}>
                {isViewMode && <div className="support-option-header-title">{data?.name}</div>}
                {!isCreateMode && (
                    <div className="support-option-header-actions">
                        <button
                            aria-label="edit-btn"
                            className={`edit-btn ${editable ? 'edit' : 'view'}`}
                            onClick={handleEditClick}
                            disabled={isSubmitting}
                        />
                        <button
                            aria-label="delete-btn"
                            className="delete-btn delete-btn-icon"
                            onClick={() =>
                                setModalConfig({
                                    title: DONATE_TEXT.QUESTION.SUPPORT_OPTION.DELETE,
                                    onConfirm: handleDelete,
                                })
                            }
                            disabled={isSubmitting}
                        />
                    </div>
                )}
            </div>

            <div className="support-option-fields">
                {!isViewMode && (
                    <div className="support-option-field">
                        <DonateInput
                            name="name"
                            isTitle={true}
                            value={name}
                            editable={editable}
                            onValueChange={(val) => handleValueChange('name', val)}
                            onBlur={() => validateField('name', name)}
                            isRequired={true}
                            maxLength={VALIDATION_PARAMS.supportOptions.name.maxLength}
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                )}
                <div className="support-option-field">
                    <DonateInput
                        name="value"
                        isTitle={true}
                        placeholder={DONATE_TEXT.PLACEHOLDER.SUPPORT_OPTION}
                        value={value}
                        editable={editable}
                        onValueChange={(val) => handleValueChange('value', val)}
                        onBlur={() => validateField('value', value)}
                        isRequired={true}
                        maxLength={VALIDATION_PARAMS.supportOptions.value.maxLength}
                    />
                    {errors.value && <span className="error">{errors.value}</span>}
                </div>
            </div>

            {editable && (
                <div className="support-option-actions">
                    <Button type="button" onClick={handleCancel} buttonStyle="secondary" disabled={isSubmitting}>
                        {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSaveClick}
                        buttonStyle="primary"
                        disabled={isSubmitting || hasEmptyFields || !hasChanges}
                    >
                        {DONATE_TEXT.BUTTON.PUBLISH}
                    </Button>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!modalConfig}
                isButtonsDisabled={isSubmitting}
                title={modalConfig?.title ?? ''}
                onConfirm={async () => {
                    try {
                        await modalConfig?.onConfirm?.();
                        setModalConfig(null);
                    } catch (error) {
                        // Error handling is delegated to the action handlers
                        // Keep modal open for user retry or cancellation
                    }
                }}
                onCancel={() => setModalConfig(null)}
                onClose={() => setModalConfig(null)}
            />
        </div>
    );
};
