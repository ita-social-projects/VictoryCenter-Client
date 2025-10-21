import React, { forwardRef, useCallback, useState } from 'react';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import { InputLabel } from '../../../../../components/admin/input-label/InputLabel';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { InputError } from '../../../../../components/admin/input-error/InputError';
import { Button } from '../../../../../components/admin/button/Button';
import { PartnerForm } from './partner-form/PartnerForm';
import { PartnerSectionFormValues, PartnerFormValues } from '../../../../../types/admin/partners';
import { PARTNER_SECTION_VALIDATION } from '../../../../../validation/admin/partner-schema/partner-schema';
import './PartnerSectionForm.scss';
import classNames from 'classnames';
import { PARTNER_VALIDATION, PARTNERS_TEXT } from '../../../../../const/admin/partners';

export interface PartnerSectionFormProps {
    value: PartnerSectionFormValues;
    onChange: (value: PartnerSectionFormValues) => void;
    onDelete: () => void;
    onEdit: () => void;
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
        const [localErrors, setLocalErrors] = useState<{
            title?: string;
            description?: string;
            partners?: Array<{ image?: string; description?: string }>;
        }>({});

        const handleTitleChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value;
                onChange({ ...value, title: newValue });

                const error = PARTNER_SECTION_VALIDATION.validateSectionTitle(newValue);
                setLocalErrors((prev) => ({ ...prev, title: error }));
            },
            [value, onChange],
        );

        const handleDescriptionChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value;
                onChange({ ...value, description: newValue });

                const error = PARTNER_SECTION_VALIDATION.validateSectionDescription(newValue);
                setLocalErrors((prev) => ({ ...prev, description: error }));
            },
            [value, onChange],
        );

        // Обробка зміни партнера
        const handlePartnerChange = useCallback(
            (index: number, partnerValue: PartnerFormValues) => {
                const newPartners = [...value.partners];
                newPartners[index] = partnerValue;
                onChange({ ...value, partners: newPartners });

                // Валідація партнера
                const imageError = PARTNER_SECTION_VALIDATION.validatePartnerImage(partnerValue.image);
                const descError = PARTNER_SECTION_VALIDATION.validatePartnerDescription(partnerValue.description);

                const newPartnerErrors = [...(localErrors.partners || [])];
                newPartnerErrors[index] = {
                    image: imageError,
                    description: descError,
                };
                setLocalErrors((prev) => ({ ...prev, partners: newPartnerErrors }));
            },
            [value, onChange, localErrors.partners],
        );

        // Видалення партнера
        const handlePartnerDelete = useCallback(
            (index: number) => {
                const newPartners = value.partners.filter((_: PartnerFormValues, i: number) => i !== index);
                onChange({ ...value, partners: newPartners });

                // Оновлення помилок
                const newPartnerErrors = localErrors.partners?.filter((_, i) => i !== index);
                setLocalErrors((prev) => ({ ...prev, partners: newPartnerErrors }));
            },
            [value, onChange, localErrors.partners],
        );

        const handlePartnerEdit = useCallback(
            (index: number) => {
                // 'isEditing' does not exist on PartnerFormValues, so we cannot add it directly
                // If editing state is needed, manage it separately in component state instead
                // If this function is not needed, remove it. Otherwise, leave it as a no-op:
                // Option 1: As a no-op handler
                // Option 2: Remove if unused (not shown here)
            },
            [value, onChange],
        );

        // Додавання нового партнера
        const handleAddPartner = useCallback(() => {
            const newPartner: PartnerFormValues = {
                image: null,
                description: '',
            };
            onChange({ ...value, partners: [...value.partners, newPartner] });
        }, [value, onChange]);

        // Drag & Drop функції
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

        // Перевірка валідності форми
        const isFormValid = () => {
            if (localErrors.title || localErrors.description) return false;
            if (localErrors.partners?.some((p) => p?.image || p?.description)) return false;
            if (!value.title || !value.description) return false;
            if (value.partners.length === 0) return false;
            return true;
        };

        const displayErrors = errors || localErrors;

        return (
            <div ref={ref} className="partner-section">
                <div className="partner-section__content">
                    <div className="partner-section__header">
                        <div className="partner-section__field">
                            <InputLabel htmlFor="section-title" text={PARTNERS_TEXT.FORM.LABEL.TITLE} isRequired />
                            <TextAreaWithCharacterLimit
                                value={value.title}
                                onChange={handleTitleChange}
                                id="section-title"
                                name="title"
                                disabled={disabled}
                                maxLength={PARTNER_VALIDATION.title.max}
                                placeholder={PARTNERS_TEXT.SECTION.TITLE_PLACEHOLDER}
                                rows={2}
                            />
                            {displayErrors?.title && <InputError error={displayErrors.title} />}
                        </div>

                        <div className="partner-section__field">
                            <InputLabel htmlFor="section-description" text={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION} isRequired />
                            <TextAreaWithCharacterLimit
                                value={value.description}
                                onChange={handleDescriptionChange}
                                id="section-description"
                                name="description"
                                disabled={disabled}
                                maxLength={PARTNER_VALIDATION.description.max}
                                placeholder={PARTNERS_TEXT.SECTION.DESCRIPTION_PLACEHOLDER}
                                rows={2}
                            />
                            {displayErrors?.description && <InputError error={displayErrors.description} />}
                        </div>
                    </div>

                    <div className="partner-section__partners">
                        <div className="partner-section__partners-header">
                            <h3>Партнери ({value.partners.length})</h3>
                            {value.partners.length === 0 && (
                                <p className="partner-section__empty-message">
                                    {PARTNERS_TEXT.SECTION.EMPTY_MESSAGE}
                                </p>
                            )}
                        </div>

                        <div className="partner-section__partners-list">
                            {value.partners.map((partner: PartnerFormValues, index: number) => (
                                <div
                                    key={index}
                                    className={classNames('partner-section__card-wrapper', {
                                        'partner-section__card-wrapper--dragging': draggedIndex === index,
                                        'partner-section__card-wrapper--drop-target': dropTargetIndex === index,
                                    })}
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
                                        onEdit={() => handlePartnerEdit(index)}
                                        disabled={disabled}
                                        error={displayErrors?.partners?.[index]}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="partner-section__add-button"
                            onClick={handleAddPartner}
                            disabled={disabled || value.partners.length >= 10}
                        >
                            <PlusIcon className="partner-section__add-icon" />
                            <span>{PARTNERS_TEXT.BUTTON.ADD_PARTNER}</span>
                        </button>
                    </div>
                </div>

                <div className="partner-section__actions">
                    <Button buttonStyle="secondary" onClick={onDelete} disabled={disabled}>
                        Видалити секцію
                    </Button>
                    <Button buttonStyle="primary" onClick={onPublish} disabled={disabled || !isFormValid()}>
                        Опублікувати
                    </Button>
                </div>
            </div>
        );
    },
);

PartnerSectionForm.displayName = 'PartnerSectionForm';
