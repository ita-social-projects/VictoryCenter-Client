import { memo, useCallback, useMemo, useState } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { Button } from '@/components/admin/button/Button';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { getNormalizedInputTextWhileTyping } from '@/utils/functions/formatters/text-formatters';

import {
    HippotherapyScientificReference,
    HippotherapyScientificReferencesSectionContent,
} from '@/types/admin/hippotherapy-page';
import { ScientificReferenceCard } from './scientific-reference-card/ScientificReferenceCard';
import './ScientificReferencesSection.scss';

export interface ScientificReferencesSectionProps {
    value: HippotherapyScientificReferencesSectionContent;
    onChange: (value: HippotherapyScientificReferencesSectionContent) => void;
    disabled?: boolean;
}

const getExpandKey = (reference: HippotherapyScientificReference) =>
    reference.id !== null ? `id-${reference.id}` : `local-${reference.localId}`;

const validateReferenceText = (text: string) => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(text.trim());

const ScientificReferencesSectionComponent = ({ value, onChange, disabled }: ScientificReferencesSectionProps) => {
    const [titleError, setTitleError] = useState<string | undefined>();
    const [descriptionError, setDescriptionError] = useState<string | undefined>();
    const [nameErrors, setNameErrors] = useState<Record<string, string | undefined>>({});
    const [urlErrors, setUrlErrors] = useState<Record<string, string | undefined>>({});
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [newReferenceLocalId, setNewReferenceLocalId] = useState<string | null>(null);

    const areAllReferencesValid = useMemo(
        () =>
            value.scientificReferences.every(
                (reference) => !validateReferenceText(reference.name) && !validateReferenceText(reference.url),
            ),
        [value.scientificReferences],
    );

    const handleToggleExpand = useCallback(
        (localId: string) => {
            const reference = value.scientificReferences.find((item) => item.localId === localId);
            if (!reference) return;

            const key = getExpandKey(reference);

            setExpandedIds((prev) => {
                const next = new Set(prev);
                if (next.has(key)) {
                    next.delete(key);
                } else {
                    next.add(key);
                }
                return next;
            });
        },
        [value.scientificReferences],
    );

    const handleAddReference = useCallback(() => {
        const newReference: HippotherapyScientificReference = {
            localId: crypto.randomUUID(),
            id: null,
            name: '',
            url: '',
        };

        onChange({
            ...value,
            scientificReferences: [...value.scientificReferences, newReference],
        });

        setExpandedIds((prev) => new Set(prev).add(getExpandKey(newReference)));
        setNewReferenceLocalId(newReference.localId);
    }, [onChange, value]);

    const handleTitleChange = (title: string) => {
        onChange({ ...value, title });
        setTitleError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(title)));
    };

    const handleDescriptionChange = (description: string) => {
        onChange({ ...value, description });
        setDescriptionError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(description)));
    };

    const handleNameChange = (localId: string, name: string) => {
        const normalisedName = getNormalizedInputTextWhileTyping(name);

        const scientificReferences = value.scientificReferences.map((reference) =>
            reference.localId === localId ? { ...reference, name: normalisedName } : reference,
        );
        onChange({ ...value, scientificReferences });
        if (nameErrors[localId] !== undefined) {
            setNameErrors((prev) => ({
                ...prev,
                [localId]: validateReferenceText(normalisedName),
            }));
        }
    };

    const handleUrlChange = (localId: string, url: string) => {
        const scientificReferences = value.scientificReferences.map((reference) =>
            reference.localId === localId ? { ...reference, url } : reference,
        );
        onChange({ ...value, scientificReferences });
        if (urlErrors[localId] !== undefined) {
            setUrlErrors((prev) => ({ ...prev, [localId]: validateReferenceText(url) }));
        }
    };

    const handleNameBlur = (localId: string) => {
        const reference = value.scientificReferences.find((item) => item.localId === localId);
        setNameErrors((prev) => ({
            ...prev,
            [localId]: validateReferenceText(reference?.name ?? ''),
        }));
    };

    const handleUrlBlur = (localId: string) => {
        const reference = value.scientificReferences.find((item) => item.localId === localId);
        setUrlErrors((prev) => ({
            ...prev,
            [localId]: validateReferenceText(reference?.url ?? ''),
        }));
    };

    return (
        <div className="scientific-references-section">
            <div className="scientific-references-section-summary">
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                    isRequired
                    id="scientific-references-title"
                    name="scientific-references-title"
                    value={value.title}
                    onChange={handleTitleChange}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.RESEARCH_TITLE}
                    error={titleError}
                    disabled={disabled}
                />
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    isRequired
                    id="scientific-references-description"
                    name="scientific-references-description"
                    value={value.description}
                    onChange={handleDescriptionChange}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.RESEARCH_DESCRIPTION}
                    error={descriptionError}
                    disabled={disabled}
                />
            </div>
            <div className="scientific-references-section-list">
                {value.scientificReferences.map((reference) => (
                    <ScientificReferenceCard
                        key={reference.localId}
                        localId={reference.localId}
                        name={reference.name}
                        url={reference.url}
                        isExpanded={expandedIds.has(getExpandKey(reference))}
                        autoFocus={reference.localId === newReferenceLocalId}
                        canDelete={value.scientificReferences.length > 1}
                        nameError={nameErrors[reference.localId]}
                        urlError={urlErrors[reference.localId]}
                        disabled={disabled}
                        onToggleExpand={handleToggleExpand}
                        onNameChange={handleNameChange}
                        onUrlChange={handleUrlChange}
                        onNameBlur={handleNameBlur}
                        onUrlBlur={handleUrlBlur}
                    />
                ))}
                <Button
                    buttonStyle="primary"
                    type="button"
                    className="scientific-references-section-add-button"
                    onClick={handleAddReference}
                    disabled={disabled || !areAllReferencesValid}
                >
                    {HIPPOTHERAPY_PAGE_TEXT.BUTTON.ADD_REFERENCE}
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};

export const ScientificReferencesSection = memo(ScientificReferencesSectionComponent);
