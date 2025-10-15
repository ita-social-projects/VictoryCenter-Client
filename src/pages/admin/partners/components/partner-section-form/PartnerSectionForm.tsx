import React, { forwardRef, useCallback, useState, useRef } from 'react';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import { InputLabel } from '../../../../../components/admin/input-label/InputLabel';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { InputError } from '../../../../../components/admin/input-error/InputError';
import { PartnerForm, PartnerFormValues } from './partner-form/PartnerForm';
import { ImageValues, Image } from '../../../../../types/common/image';
import './PartnerSectionForm.scss';

export interface PartnerSectionFormValues {
    title: string;
    description: string;
    partners: PartnerFormValues[];
}

export interface PartnerSectionFormProps {
    value: PartnerSectionFormValues;
    onChange: (value: PartnerSectionFormValues) => void;
    onDelete: () => void;
    onPublish: () => void;
    disabled?: boolean;
    errors?: {
        title?: string;
        description?: string;
        partners?: Array<{
            image?: string;
            description?: string;
        }>;
    };
}

export const PartnerSectionForm = forwardRef<HTMLDivElement, PartnerSectionFormProps>(
    ({ value, onChange, onDelete, onPublish, disabled = false, errors }, ref) => {
        const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
        const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

        const handleTitleChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ ...value, title: e.target.value });
            },
            [value, onChange],
        );

        const handleDescriptionChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange({ ...value, description: e.target.value });
            },
            [value, onChange],
        );

        const handlePartnerChange = useCallback(
            (index: number, partnerValue: PartnerFormValues) => {
                const newPartners = [...value.partners];
                newPartners[index] = partnerValue;
                onChange({ ...value, partners: newPartners });
            },
            [value, onChange],
        );

        const handlePartnerDelete = useCallback(
            (index: number) => {
                const newPartners = value.partners.filter((_, i) => i !== index);
                onChange({ ...value, partners: newPartners });
            },
            [value, onChange],
        );

        const handleAddPartner = useCallback(() => {
            const newPartner: PartnerFormValues = {
                image: null,
                description: '',
            };
            onChange({ ...value, partners: [...value.partners, newPartner] });
        }, [value, onChange]);

        const handleDragStart = useCallback((index: number) => {
            setDraggedIndex(index);
        }, []);

        const handleDragOver = useCallback(
            (e: React.DragEvent<HTMLDivElement>, index: number) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) {
                    setDropTargetIndex(index);
                }
            },
            [draggedIndex],
        );

        const handleDragLeave = useCallback(() => {
            setDropTargetIndex(null);
        }, []);

        const handleDrop = useCallback(
            (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== targetIndex) {
                    const newPartners = [...value.partners];
                    const [removed] = newPartners.splice(draggedIndex, 1);
                    newPartners.splice(targetIndex, 0, removed);
                    onChange({ ...value, partners: newPartners });
                }
                setDraggedIndex(null);
                setDropTargetIndex(null);
            },
            [draggedIndex, value, onChange],
        );

        const handleDragEnd = useCallback(() => {
            setDraggedIndex(null);
            setDropTargetIndex(null);
        }, []);

        return (
            <div ref={ref} className="partner-section">
                <div className="partner-section__content">
                    <div className="partner-section__header">
                        <div className="partner-section__field">
                            <InputLabel htmlFor="section-title" text="Заголовок" />
                            <TextAreaWithCharacterLimit
                                value={value.title}
                                onChange={handleTitleChange}
                                id="section-title"
                                name="title"
                                disabled={disabled}
                                maxLength={50}
                                placeholder="Введіть заголовок"
                                rows={2}
                            />
                            {errors?.title && <InputError error={errors.title} />}
                        </div>

                        <div className="partner-section__field">
                            <InputLabel htmlFor="section-description" text="Опис" />
                            <TextAreaWithCharacterLimit
                                value={value.description}
                                onChange={handleDescriptionChange}
                                id="section-description"
                                name="description"
                                disabled={disabled}
                                maxLength={70}
                                placeholder="Введіть опис"
                                rows={2}
                            />
                            {errors?.description && <InputError error={errors.description} />}
                        </div>
                    </div>

                    <div className="partner-section__partners">
                        {value.partners.map((partner, index) => (
                            <div
                                key={index}
                                className={`partner-section__card-wrapper ${
                                    draggedIndex === index ? 'partner-section__card-wrapper--dragging' : ''
                                } ${dropTargetIndex === index ? 'partner-section__card-wrapper--drop-target' : ''}`}
                                draggable={!disabled}
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                            >
                                {dropTargetIndex === index && draggedIndex !== null && (
                                    <div className="partner-section__drop-indicator" />
                                )}
                                <PartnerForm
                                    value={partner}
                                    onChange={(newValue) => handlePartnerChange(index, newValue)}
                                    onDelete={() => handlePartnerDelete(index)}
                                    disabled={disabled}
                                    error={errors?.partners?.[index]}
                                />
                            </div>
                        ))}

                        <button
                            type="button"
                            className="partner-section__add-button"
                            onClick={handleAddPartner}
                            disabled={disabled}
                        >
                            <PlusIcon className="partner-section__add-icon" />
                            <span>Додати партнера</span>
                        </button>
                    </div>
                </div>

                <div className="partner-section__actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onDelete}
                        disabled={disabled}
                    >
                        Видалити секцію
                    </button>
                    <button
                        type="button"
                        className="primary-button"
                        onClick={onPublish}
                        disabled={disabled}
                    >
                        Опублікувати
                    </button>
                </div>
            </div>
        );
    }
);

PartnerSectionForm.displayName = 'PartnerSection';