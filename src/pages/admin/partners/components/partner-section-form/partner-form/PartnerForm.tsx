import React, { useState } from 'react';
import { ReactComponent as DeleteDefault } from '../../../../../../assets/icons/delete-default.svg';
import { ReactComponent as DeleteHover } from '../../../../../../assets/icons/delete-hover.svg';
import { ReactComponent as DeletePressed } from '../../../../../../assets/icons/delete-pressed.svg';
import { ReactComponent as DeleteDisabled } from '../../../../../../assets/icons/delete-disabled.svg';
import { ReactComponent as EditDefault } from '../../../../../../assets/icons/edit-default.svg';
import { ReactComponent as EditHover } from '../../../../../../assets/icons/edit-hover.svg';
import { ReactComponent as EditPressed } from '../../../../../../assets/icons/edit-pressed.svg';
import { ReactComponent as EditDisabled } from '../../../../../../assets/icons/edit-disabled.svg';
import { ReactComponent as DragIcon } from '../../../../../../assets/icons/dragger.svg';
import { ImageInput } from '../../../../../../components/admin/image-input/ImageInput';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { InputLabel } from '../../../../../../components/admin/input-label/InputLabel';
import { InputError } from '../../../../../../components/admin/input-error/InputError';
import { PartnerFormValues } from '../../../../../../types/admin/partners';
import './PartnerForm.scss';
import { ImageValues } from '../../../../../../types/common/image';
import { PARTNERS_TEXT } from '../../../../../../const/admin/partners';

export interface PartnerFormProps {
    value: PartnerFormValues;
    onChange: (value: PartnerFormValues) => void;
    onDelete: () => void;
    onEdit: () => void;
    onDragStart?: () => void;
    disabled?: boolean;
    error?: {
        image?: string;
        description?: string;
    };
}

export const PartnerForm: React.FC<PartnerFormProps> = ({
    value,
    onChange,
    onDelete,
    onEdit,
    onDragStart,
    disabled = false,
    error,
}) => {
    const [editState, setEditState] = useState<'default' | 'hover' | 'pressed'>('default');
    const [deleteState, setDeleteState] = useState<'default' | 'hover' | 'pressed'>('default');
    const [isEditing, setIsEditing] = useState(false);

    const handleImageChange = (image: ImageValues | null) => {
        onChange({ ...value, image });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ ...value, description: e.target.value });
    };

    const handleDragStart = (e: React.MouseEvent) => {
        if (onDragStart) {
            onDragStart();
        }
    };

    const handleEditClick = () => {
        setIsEditing(!isEditing);
        onEdit();
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const getEditIcon = () => {
        if (disabled) return <EditDisabled />;
        switch (editState) {
            case 'hover':
                return <EditHover />;
            case 'pressed':
                return <EditPressed />;
            default:
                return <EditDefault />;
        }
    };

    const getDeleteIcon = () => {
        if (disabled) return <DeleteDisabled />;
        switch (deleteState) {
            case 'hover':
                return <DeleteHover />;
            case 'pressed':
                return <DeletePressed />;
            default:
                return <DeleteDefault />;
        }
    };

    return (
        <div className="partner-form" data-testid="partner-form">
            <div className="partner-form__header">
                <button
                    type="button"
                    className="partner-form__drag-button"
                    onMouseDown={handleDragStart}
                    disabled={disabled}
                    aria-label="Перетягнути партнера"
                >
                    <DragIcon />
                </button>
                <div className="partner-form__buttons-wrapper">
                    <button
                        type="button"
                        className="partner-form__edit-button"
                        onClick={handleEditClick}
                        onMouseEnter={() => !disabled && setEditState('hover')}
                        onMouseLeave={() => !disabled && setEditState('default')}
                        onMouseDown={() => !disabled && setEditState('pressed')}
                        onMouseUp={() => !disabled && setEditState('hover')}
                        disabled={disabled}
                        aria-label={PARTNERS_TEXT.PARTNER.EDIT}
                    >
                        {getEditIcon()}
                    </button>
                    <button
                        type="button"
                        className="partner-form__delete-button"
                        onClick={onDelete}
                        onMouseEnter={() => !disabled && setDeleteState('hover')}
                        onMouseLeave={() => !disabled && setDeleteState('default')}
                        onMouseDown={() => !disabled && setDeleteState('pressed')}
                        onMouseUp={() => !disabled && setDeleteState('hover')}
                        disabled={disabled}
                        aria-label={PARTNERS_TEXT.PARTNER.DELETE}
                    >
                        {getDeleteIcon()}
                    </button>
                </div>
            </div>

            <div className="partner-form__content">
                <div className="partner-form__image-section">
                    <ImageInput
                        value={value.image}
                        onChange={handleImageChange}
                        disabled={disabled || !isEditing}
                        id={`partner-image-${Date.now()}`}
                        name="partnerImage"
                    />
                    {error?.image && <InputError error={error.image} />}
                </div>

                <div className="partner-form__description">
                    <InputLabel
                        htmlFor={`partner-description-${Date.now()}`}
                        text={PARTNERS_TEXT.PARTNER.DESCRIPTION_LABEL}
                    />
                    <TextAreaWithCharacterLimit
                        value={value.description}
                        onChange={handleDescriptionChange}
                        id={`partner-description-${Date.now()}`}
                        name="partnerDescription"
                        disabled={disabled || !isEditing}
                        maxLength={200}
                        placeholder={PARTNERS_TEXT.PARTNER.DESCRIPTION_PLACEHOLDER}
                        rows={3}
                    />
                    {error?.description && <InputError error={error.description} />}
                </div>
            </div>
        </div>
    );
};
