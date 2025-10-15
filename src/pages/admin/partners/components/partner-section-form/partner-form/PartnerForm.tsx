import React, { forwardRef, useCallback, useState } from 'react';
import { ReactComponent as DragIcon } from '../../../../../assets/icons/drag.svg';
import { ReactComponent as DeleteIcon } from '../../../../../assets/icons/delete.svg';
import { ImageInput } from '../../../../../../components/admin/image-input/ImageInput';
import { InputLabel } from '../../../../../../components/admin/input-label/InputLabel';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { InputError } from '../../../../../../components/admin/input-error/InputError';
import { ImageValues, Image } from '../../../../../../types/common/image';
import './PartnerForm.scss';
import { PARTNERS_TEXT } from '../../../../../../const/admin/partners';

export interface PartnerFormValues {
    image: ImageValues | Image | null;
    description: string;
}

export interface PartnerFormProps {
    value: PartnerFormValues;
    onChange: (value: PartnerFormValues) => void;
    onDelete: () => void;
    disabled?: boolean;
    error?: {
        image?: string;
        description?: string;
    };
}



export const PartnerForm = forwardRef<HTMLDivElement, PartnerFormProps>(
    ({ value, onChange, onDelete, disabled = false, error }, ref) => {
        const [isDragging, setIsDragging] = useState(false);

        const handleImageChange = useCallback(
            (image: ImageValues | null) => {
                onChange({ ...value, image });
            },
            [value, onChange]
        );

        const handleDescriptionChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ ...value, description: e.target.value });
            },
            [value, onChange]
        );

        const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            setIsDragging(true);
            e.dataTransfer.effectAllowed = 'move';
        }, []);

        const handleDragEnd = useCallback(() => {
            setIsDragging(false);
        }, []);

        return (
            <div
                ref={ref}
                className={`partner-form ${isDragging ? 'partner-form--dragging' : ''} ${disabled ? 'partner-card--disabled' : ''}`}
                draggable={!disabled}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="partner-form__header">
                    <button
                        type="button"
                        className="partner-form__drag-button"
                        disabled={disabled}
                        aria-label="Перетягнути"
                    >
                        <DragIcon className="partner-form__drag-icon" />
                    </button>
                    <button
                        type="button"
                        className="partner-form__delete-button"
                        onClick={onDelete}
                        disabled={disabled}
                        aria-label="Видалити"
                    >
                        <DeleteIcon className="partner-form__delete-icon" />
                    </button>
                </div>

                <div className="partner-form__image-section">
                    <ImageInput
                        value={value.image}
                        onChange={handleImageChange}
                        disabled={disabled}
                        id={`partner-image-${Math.random()}`}
                        name="partner-image"
                    />
                    {error?.image && <InputError error={error.image} />}
                </div>

                <div className="partner-form__description-section">
                    <InputLabel htmlFor="partner-description" text={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION} />
                    <TextAreaWithCharacterLimit
                        value={value.description}
                        onChange={handleDescriptionChange}
                        id="partner-description"
                        name="description"
                        disabled={disabled}
                        maxLength={50}
                        placeholder="Введіть текст"
                        rows={3}
                    />
                    {error?.description && <InputError error={error.description} />}
                </div>
            </div>
        );
    }
);

PartnerForm.displayName = 'PartnerForm';
