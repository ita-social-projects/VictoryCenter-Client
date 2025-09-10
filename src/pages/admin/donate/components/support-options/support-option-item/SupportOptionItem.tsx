import { useEffect, useState } from 'react';
import { Button } from '../../../../../../components/admin/button/Button';
import { Input } from '../../input/Input';
import './SupportOptionItem.scss';
import { SupportOptionsType } from '../../../../../../types/admin/donate';
import { ConfirmationModal } from '../../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { DONATE_TEXT } from '../../../../../../const/admin/donate';

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

    useEffect(() => {
        setName(data?.name ?? '');
        setValue(data?.value ?? '');
    }, [data]);

    const hasEmptyFields = !name.trim() || !value.trim();

    const hasChanges = () => {
        return name !== (data?.name ?? '') || value !== (data?.value ?? '');
    };

    const handleSave = () => {
        if (hasEmptyFields) return;
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
        if (mode === SupportOptionItemMode.Create) onCancel?.();
        else setMode(SupportOptionItemMode.View);
    };

    const handleDelete = () => {
        if (!data?.id || !onDelete) return;
        onDelete(data.id);
        setIsDeleting(false);
    };

    const editable = mode !== SupportOptionItemMode.View;

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
                            className={`delete-btn ${isDeleting ? 'pressed' : ''}`}
                            onClick={() =>
                                setModalConfig({
                                    title: DONATE_TEXT.QUESTION.SUPPORT_OPTION.DELETE,
                                    onConfirm: handleDelete,
                                })
                            }
                        />
                    </div>
                )}
            </div>

            <div className="support-option-fields">
                {mode !== SupportOptionItemMode.View && (
                    <Input name="name" value={name} editable={editable} handleChange={(e) => setName(e.target.value)} />
                )}
                <Input
                    name="value"
                    placeholder={DONATE_TEXT.PLACEHOLDER.SUPPORT_OPTION}
                    value={value}
                    editable={editable}
                    handleChange={(e) => setValue(e.target.value)}
                />
            </div>

            {editable && (
                <div className="support-option-actions">
                    <Button type="button" onClick={handleCancel} buttonStyle="secondary">
                        {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                    </Button>
                    <Button
                        type="button"
                        aria-label="save-support-option"
                        onClick={
                            mode === SupportOptionItemMode.Edit
                                ? handleSave
                                : () =>
                                      setModalConfig({
                                          title: DONATE_TEXT.QUESTION.SUPPORT_OPTION.ADD,
                                          onConfirm: handleSave,
                                      })
                        }
                        buttonStyle="primary"
                        disabled={isSubmitting || hasEmptyFields || !hasChanges()}
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
                onCancel={() => setModalConfig(null)}
                onClose={() => setModalConfig(null)}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </div>
    );
};
