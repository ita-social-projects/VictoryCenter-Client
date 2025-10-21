import React from 'react';
import { ReactComponent as DeleteIcon } from '../../../../../../assets/icons/delete.svg';
import { ReactComponent as EditIcon } from '../../../../../../assets/icons/edit.svg';
import { ImageInput } from '../../../../../../components/admin/image-input/ImageInput';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { InputLabel } from '../../../../../../components/admin/input-label/InputLabel';
import { InputError } from '../../../../../../components/admin/input-error/InputError';
import { PartnerFormValues } from '../../../../../../types/admin/partners';
import './PartnerForm.scss';
import { ImageValues } from '../../../../../../types/common/image';

export interface PartnerFormProps {
    value: PartnerFormValues;
    onChange: (value: PartnerFormValues) => void;
    onDelete: () => void;
    onEdit: () => void;
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
    disabled = false,
    error,
}) => {
    const handleImageChange = (image: ImageValues | null) => {
        onChange({ ...value, image });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ ...value, description: e.target.value });
    };

    return (
        <div className="partner-form">
            <button
                type="button"
                className="partner-form__edit"
                onClick={onEdit}
                disabled={disabled}
                aria-label="Редагувати партнера"
            >
                <EditIcon />
            </button>
            <button
                type="button"
                className="partner-form__delete"
                onClick={onDelete}
                disabled={disabled}
                aria-label="Видалити партнера"
            >
                <DeleteIcon />
            </button>

            <div className="partner-form__content">
                <div className="partner-form__image">
                    <ImageInput
                        value={value.image}
                        onChange={handleImageChange}
                        disabled={disabled}
                        id={`partner-image-${Date.now()}`}
                        name="partnerImage"
                    />
                    {error?.image && <InputError error={error.image} />}
                </div>

                <div className="partner-form__description">
                    <InputLabel htmlFor={`partner-description-${Date.now()}`} text="Опис партнера" />
                    <TextAreaWithCharacterLimit
                        value={value.description}
                        onChange={handleDescriptionChange}
                        id={`partner-description-${Date.now()}`}
                        name="partnerDescription"
                        disabled={disabled}
                        maxLength={200}
                        placeholder="Введіть опис партнера"
                        rows={3}
                    />
                    {error?.description && <InputError error={error.description} />}
                </div>
            </div>
        </div>
    );
};

