import { useEffect, useState } from 'react';
import { Button } from '../../../../../components/admin/button/Button';
import { Input } from '../input/Input';
import './SupportOption.scss';
import { SupportOptionsType } from '../../../../../types/admin/donate';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

export type SupportOptionFormMode = 'create' | 'edit' | 'view';

export interface SupportOptionProps {
    data?: SupportOptionsType;
    initialMode?: SupportOptionFormMode;
    onSave?: (item: SupportOptionsType) => void;
    onCancel?: () => void;
    onDelete?: (id: number) => void;
}

export const SupportOption = ({ data, initialMode, onSave, onCancel, onDelete }: SupportOptionProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mode, setMode] = useState<SupportOptionFormMode>(initialMode ?? (data ? 'view' : 'create'));
    const [name, setName] = useState(data?.name ?? '');
    const [value, setValue] = useState(data?.value ?? '');

    useEffect(() => {
        if (data) {
            setName(data.name);
            setValue(data.value);
        }
    }, [data]);

    const hasEmptyFields = !name.trim() || !value.trim();

    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setMode((prev) => (prev === 'view' ? 'edit' : 'view'));
    };

    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDeleting(true);
    };

    const handleDeleteCancel = () => {
        setIsDeleting(false);
    };

    const handleDelete = async () => {
        if (!data?.id || !onDelete) {
            setIsDeleting(false);
            return;
        }
        try {
            onDelete?.(data?.id ?? -1);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        setName('');
        setValue('');
        onCancel?.();
    };

    const handleSave = async () => {
        if (hasEmptyFields) return;

        setIsSubmitting(true);
        try {
            const newItem: SupportOptionsType = {
                id: data?.id ?? Date.now(),
                name,
                value,
            };
            onSave?.(newItem);
        } finally {
            setIsSubmitting(false);
            setMode('view');
        }
    };

    return (
        <div className="support-option">
            {mode === 'create' || mode === 'edit' ? (
                <div className="support-option-editable">
                    {mode === 'edit' && (
                        <div className="support-option-header-actions">
                            <button className={`edit-btn ${mode}`} onClick={handleEditClick}></button>
                            <button
                                className={`delete-btn ${isDeleting ? 'pressed' : ''}`}
                                onClick={handleDeleteClick}
                            ></button>
                        </div>
                    )}
                    <div className="support-option-fields">
                        <Input
                            name="name"
                            className="support-option-fields-name"
                            value={data?.name}
                            handleChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            name="value"
                            placeholder="Введіть реквізити"
                            value={data?.value}
                            handleChange={(e) => setValue(e.target.value)}
                        />
                    </div>
                    <div className="support-option-actions">
                        <Button type="button" onClick={handleCancel} buttonStyle="secondary">
                            Відмінити
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            buttonStyle="primary"
                            disabled={isSubmitting || hasEmptyFields}
                        >
                            {isSubmitting ? 'Збереження...' : 'Опублікувати'}
                        </Button>
                    </div>
                    <ConfirmationModal
                        isOpen={isDeleting}
                        isButtonsDisabled={false}
                        title={'Видалити реквізити?'}
                        onConfirm={handleDelete}
                        onCancel={handleDeleteCancel}
                        onClose={handleDeleteCancel}
                        confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                        cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                    />
                </div>
            ) : (
                <>
                    <div className="support-option-header">
                        <div className="support-option-header-title">{data?.name}</div>
                        <div className="support-option-header-actions">
                            <button className="edit-btn" onClick={handleEditClick}></button>
                            <button
                                className={`delete-btn ${isDeleting ? 'pressed' : ''}`}
                                onClick={handleDeleteClick}
                            ></button>
                        </div>
                    </div>
                    <Input name="option" value={data?.value} editable={false} />
                    <ConfirmationModal
                        isOpen={isDeleting}
                        isButtonsDisabled={false}
                        title={'Видалити реквізити?'}
                        onConfirm={handleDelete}
                        onCancel={handleDeleteCancel}
                        onClose={handleDeleteCancel}
                        confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                        cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                    />
                </>
            )}
        </div>
    );
};
