import { useCallback, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as EyeOpenedIcon } from '@/assets/icons/eye-opened.svg';
import { Button } from '@/components/admin/button/Button';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT } from '@/const/admin/events';
import './EditableHeaderSection.scss';

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

    useEffect(() => {
        if (mode === 'view') {
            setDraftValue(initialPublishedHtml);
        }
    }, [initialPublishedHtml, mode]);

    const handleChange = useCallback(
        (value: string) => {
            const normalizedValue = normalizeEventsDraftHtml(value);
            setDraftValue(normalizedValue);
            onDraftChange(normalizedValue);
        },
        [onDraftChange],
    );

    const handleBlur = useCallback(() => {
        const normalizedValue = normalizeEventsDraftHtml(draftValue, true);
        setDraftValue(normalizedValue);
        onDraftChange(normalizedValue);
    }, [draftValue, onDraftChange]);

    const isEditMode = mode === 'edit';
    const isDescriptionSection = sectionId === EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
    const normalizedDraftValue = normalizeEventsDraftHtml(draftValue, true);
    const normalizedInitialValue = normalizeEventsDraftHtml(initialPublishedHtml, true);
    const isDraftChanged = normalizedDraftValue !== normalizedInitialValue;
    const isPublishButtonDisabled = disabled || isPublishForcedDisabled || !isDraftChanged || !normalizedDraftValue;
    return (
        <section
            className={`editable-header-section ${
                isDescriptionSection
                    ? 'editable-header-section--description'
                    : 'editable-header-section--events-block-title'
            } ${isEditMode ? 'editable-header-section--edit' : ''}`}
            data-testid={`${sectionId}-section`}
        >
            {!isEditMode && (
                <div className="editable-header-section-heading-row">
                    <h2>
                        <span className="editable-header-section-required-mark">*</span>
                        {heading}
                    </h2>
                    <div className="editable-header-section-actions">
                        <button
                            type="button"
                            className="editable-header-section-icon-button"
                            aria-label={`${EVENTS_TEXT.PAGE_CONTENT.ARIA_LABEL.EDIT_SECTION}: ${heading}`}
                            onClick={onEnterEditMode}
                            disabled={disabled}
                        >
                            <EditIcon />
                        </button>
                        <button
                            type="button"
                            className="editable-header-section-icon-button"
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
                        trimOnBlur
                        showCounterBelow
                    />
                    <div className="editable-header-section-form-actions">
                        <Button type="button" buttonStyle="secondary" onClick={onCancelEdit} disabled={disabled}>
                            {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                        </Button>
                        <Button
                            type="button"
                            buttonStyle="primary"
                            onClick={() => onPublish(draftValue)}
                            disabled={isPublishButtonDisabled}
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                        </Button>
                    </div>
                </>
            ) : (
                <div
                    className="editable-header-section-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeViewHtml(initialPublishedHtml) }}
                />
            )}
        </section>
    );
};
