import { memo, useCallback, useMemo, useState } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { Button } from '@/components/admin/button/Button';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
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

const validateReferenceName = (text: string) =>
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(text.trim(), HIPPOTHERAPY_PAGE_TEXT.MIN_REFERENCE_NAME_LENGTH);

const validateReferenceUrl = (text: string) =>
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(text.trim(), HIPPOTHERAPY_PAGE_TEXT.MIN_REFERENCE_URL_LENGTH);

const ScientificReferencesSectionComponent = ({ value, onChange, disabled }: ScientificReferencesSectionProps) => {
    const title = useValidatedRichTextField({
        value: value.title,
        onChange: (title) => onChange({ ...value, title }),
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
    });

    const description = useValidatedRichTextField({
        value: value.description,
        onChange: (description) => onChange({ ...value, description }),
    });

    const [nameErrors, setNameErrors] = useState<Record<string, string | undefined>>({});
    const [urlErrors, setUrlErrors] = useState<Record<string, string | undefined>>({});
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [newReferenceLocalId, setNewReferenceLocalId] = useState<string | null>(null);

    const areAllReferencesValid = useMemo(
        () =>
            value.scientificReferences.every(
                (reference) => !validateReferenceName(reference.name) && !validateReferenceUrl(reference.url),
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

    const handleNameChange = (localId: string, name: string) => {
        const scientificReferences = value.scientificReferences.map((reference) =>
            reference.localId === localId ? { ...reference, name } : reference,
        );
        onChange({ ...value, scientificReferences });

        if (nameErrors[localId] !== undefined) {
            setNameErrors((prev) => ({ ...prev, [localId]: validateReferenceName(name) }));
        }
    };

    const handleUrlChange = (localId: string, url: string) => {
        const scientificReferences = value.scientificReferences.map((reference) =>
            reference.localId === localId ? { ...reference, url } : reference,
        );
        onChange({ ...value, scientificReferences });

        if (urlErrors[localId] !== undefined) {
            setUrlErrors((prev) => ({ ...prev, [localId]: validateReferenceUrl(url) }));
        }
    };

    const handleNameBlur = (localId: string) => {
        const reference = value.scientificReferences.find((item) => item.localId === localId);
        setNameErrors((prev) => ({ ...prev, [localId]: validateReferenceName(reference?.name ?? '') }));
    };

    const handleUrlBlur = (localId: string) => {
        const reference = value.scientificReferences.find((item) => item.localId === localId);
        setUrlErrors((prev) => ({ ...prev, [localId]: validateReferenceUrl(reference?.url ?? '') }));
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
                    onChange={title.handleChange}
                    onBlur={title.handleBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.RESEARCH_TITLE}
                    error={title.error}
                    disabled={disabled}
                />
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    isRequired
                    id="scientific-references-description"
                    name="scientific-references-description"
                    value={value.description}
                    onChange={description.handleChange}
                    onBlur={description.handleBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.RESEARCH_DESCRIPTION}
                    error={description.error}
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