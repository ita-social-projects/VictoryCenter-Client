import { useCallback, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as EyeOpenedIcon } from '@/assets/icons/eye-opened.svg';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT } from '@/const/admin/events';
import {
    EventsPageTextValidationRule,
    getEventsPageTextValidationError,
    isEventsPageTextOverMaxLength,
} from '@/validation/admin/events-page-schema/events-page-schema';
import styles from './EditableHeaderSection.module.scss';

export type EditableHeaderSectionMode = 'view' | 'edit';
export type EditableHeaderSectionId =
    | typeof EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID
    | typeof EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;

export interface EditableHeaderSectionProps {
    sectionId: EditableHeaderSectionId;
    heading: string;
    inputLabel: string;
    initialPublishedHtml: string;
    maxLength: number;
    validationRule: EventsPageTextValidationRule;
    mode: EditableHeaderSectionMode;
    onEnterEditMode: () => void;
    onDraftChange: (value: string) => void;
    onCancelEdit: () => void;
    onPublish: (value: string) => void;
    /** Allows temporarily disabling publishing independently from the draft state. */
    isPublishDisabled?: boolean;
    disabled?: boolean;
    placeholder: string;
}

const sanitizeViewHtml = (html: string) =>
    DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'], ALLOWED_ATTR: [] });

export const normalizeEventsDraftHtml = (html: string, trimTrailingWhitespace = false): string => {
    if (!html) return '';

    const container = document.createElement('div');
    container.innerHTML = html;
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
        textNodes.push(node as Text);
        node = walker.nextNode();
    }

    textNodes.forEach((textNode) => {
        textNode.textContent = (textNode.textContent ?? '').replace(/\s+/g, ' ');
    });

    const firstTextNode = textNodes.find((textNode) => textNode.textContent?.trim());
    firstTextNode?.replaceData(0, firstTextNode.length, (firstTextNode.textContent ?? '').trimStart());

    if (trimTrailingWhitespace) {
        const lastTextNode = [...textNodes].reverse().find((textNode) => textNode.textContent);
        lastTextNode?.replaceData(0, lastTextNode.length, (lastTextNode.textContent ?? '').trimEnd());
    }

    return container.textContent?.trim() ? container.innerHTML : '';
};

export const EditableHeaderSection = ({
    sectionId,
    heading,
    inputLabel,
    initialPublishedHtml,
    maxLength,
    validationRule,
    mode,
    onEnterEditMode,
    onDraftChange,
    onCancelEdit,
    onPublish,
    isPublishDisabled: isPublishForcedDisabled = false,
    disabled = false,
    placeholder,
}: EditableHeaderSectionProps) => {
    const [draftValue, setDraftValue] = useState(initialPublishedHtml);
    const [validationError, setValidationError] = useState<string>();
    const [isCancelConfirmationModalOpen, setIsCancelConfirmationModalOpen] = useState(false);

    useEffect(() => {
        if (mode === 'view') {
            setDraftValue(initialPublishedHtml);
            setValidationError(undefined);
        }
    }, [initialPublishedHtml, mode]);

    const handleChange = useCallback(
        (value: string) => {
            const normalizedValue = normalizeEventsDraftHtml(value);
            setDraftValue(normalizedValue);
            onDraftChange(normalizedValue);

            if (validationError || isEventsPageTextOverMaxLength(normalizedValue, validationRule)) {
                setValidationError(getEventsPageTextValidationError(normalizedValue, validationRule));
            }
        },
        [onDraftChange, validationError, validationRule],
    );

    const handleBlur = useCallback(() => {
        const normalizedValue = normalizeEventsDraftHtml(draftValue, true);
        setDraftValue(normalizedValue);
        onDraftChange(normalizedValue);
        setValidationError(getEventsPageTextValidationError(normalizedValue, validationRule));
    }, [draftValue, onDraftChange, validationRule]);

    const isEditMode = mode === 'edit';
    const isDescriptionSection = sectionId === EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
    const normalizedDraftValue = normalizeEventsDraftHtml(draftValue, true);
    const normalizedInitialValue = normalizeEventsDraftHtml(initialPublishedHtml, true);
    const isDraftChanged = normalizedDraftValue !== normalizedInitialValue;
    const isPublishButtonDisabled =
        disabled ||
        isPublishForcedDisabled ||
        !isDraftChanged ||
        !!getEventsPageTextValidationError(normalizedDraftValue, validationRule);

    const handleCancelClick = useCallback(() => {
        if (isDraftChanged) {
            setIsCancelConfirmationModalOpen(true);
            return;
        }

        onCancelEdit();
    }, [isDraftChanged, onCancelEdit]);

    const handleCancelConfirmation = useCallback(() => {
        setIsCancelConfirmationModalOpen(false);
        onCancelEdit();
    }, [onCancelEdit]);

    const handleCloseCancelConfirmationModal = useCallback(() => {
        setIsCancelConfirmationModalOpen(false);
    }, []);

    return (
        <>
            <section
                className={`${styles['editable-header-section']} ${
                    isDescriptionSection
                        ? styles['editable-header-section--description']
                        : styles['editable-header-section--events-block-title']
                } ${isEditMode ? styles['editable-header-section--edit'] : ''}`}
                data-testid={`${sectionId}-section`}
            >
                {!isEditMode && (
                    <div className={styles['editable-header-section-heading-row']}>
                        <h2>
                            <span className={styles['editable-header-section-required-mark']}>*</span>
                            {heading}
                        </h2>
                        <div className={styles['editable-header-section-actions']}>
                            <button
                                type="button"
                                className={styles['editable-header-section-icon-button']}
                                aria-label={`${EVENTS_TEXT.PAGE_CONTENT.ARIA_LABEL.EDIT_SECTION}: ${heading}`}
                                onClick={onEnterEditMode}
                                disabled={disabled}
                            >
                                <EditIcon />
                            </button>
                            <button
                                type="button"
                                className={styles['editable-header-section-icon-button']}
                                aria-label={`${EVENTS_TEXT.PAGE_CONTENT.ARIA_LABEL.VIEW_SECTION}: ${heading}`}
                                disabled={disabled}
                            >
                                <EyeOpenedIcon />
                            </button>
                        </div>
                    </div>
                )}
                {isEditMode ? (
                    <>
                        <RichTextInputGroup
                            id={sectionId}
                            name={sectionId}
                            label={inputLabel}
                            isRequired
                            value={draftValue}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={maxLength}
                            disabled={disabled}
                            placeholder={placeholder}
                            error={validationError}
                            trimOnBlur
                            showCounterBelow
                        />
                        <div className={styles['editable-header-section-form-actions']}>
                            <Button
                                type="button"
                                buttonStyle="secondary"
                                onClick={handleCancelClick}
                                disabled={disabled}
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                            </Button>
                            <Button
                                type="button"
                                buttonStyle="primary"
                                onClick={() => onPublish(normalizedDraftValue)}
                                disabled={isPublishButtonDisabled}
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div
                        className={styles['editable-header-section-content']}
                        dangerouslySetInnerHTML={{ __html: sanitizeViewHtml(initialPublishedHtml) }}
                    />
                )}
            </section>
            <ConfirmationModal
                isOpen={isCancelConfirmationModalOpen}
                onClose={handleCloseCancelConfirmationModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={handleCancelConfirmation}
                onCancel={handleCloseCancelConfirmationModal}
            />
        </>
    );
};
