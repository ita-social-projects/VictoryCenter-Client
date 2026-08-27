import { memo, useState } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { Button } from '@/components/admin/button/Button';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { HippotherapyScientificReferencesSectionContent } from '@/types/admin/hippotherapy-page';
import { ScientificReferenceCard } from './scientific-reference-card/ScientificReferenceCard';
import './ScientificReferencesSection.scss';

export interface ScientificReferencesSectionProps {
    value: HippotherapyScientificReferencesSectionContent;
    onChange: (value: HippotherapyScientificReferencesSectionContent) => void;
    disabled?: boolean;
}

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

    const handleNameChange = (localId: string, name: string) => {
        const scientificReferences = value.scientificReferences.map((reference) =>
            reference.localId === localId ? { ...reference, name } : reference,
        );
        onChange({ ...value, scientificReferences });

        if (nameErrors[localId] !== undefined) {
            setNameErrors((prev) => ({
                ...prev,
                [localId]: HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(
                    name,
                    HIPPOTHERAPY_PAGE_TEXT.MIN_REFERENCE_NAME_LENGTH,
                ),
            }));
        }
    };

    const handleUrlChange = (localId: string, url: string) => {
        const scientificReferences = value.scientificReferences.map((reference) =>
            reference.localId === localId ? { ...reference, url } : reference,
        );
        onChange({ ...value, scientificReferences });

        if (urlErrors[localId] !== undefined) {
            setUrlErrors((prev) => ({
                ...prev,
                [localId]: HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(
                    url,
                    HIPPOTHERAPY_PAGE_TEXT.MIN_REFERENCE_URL_LENGTH,
                ),
            }));
        }
    };

    const handleNameBlur = (localId: string) => {
        const reference = value.scientificReferences.find((item) => item.localId === localId);
        setNameErrors((prev) => ({
            ...prev,
            [localId]: HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(
                reference?.name ?? '',
                HIPPOTHERAPY_PAGE_TEXT.MIN_REFERENCE_NAME_LENGTH,
            ),
        }));
    };

    const handleUrlBlur = (localId: string) => {
        const reference = value.scientificReferences.find((item) => item.localId === localId);
        setUrlErrors((prev) => ({
            ...prev,
            [localId]: HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(
                reference?.url ?? '',
                HIPPOTHERAPY_PAGE_TEXT.MIN_REFERENCE_URL_LENGTH,
            ),
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
                        canDelete={value.scientificReferences.length > 1}
                        nameError={nameErrors[reference.localId]}
                        urlError={urlErrors[reference.localId]}
                        disabled={disabled}
                        onNameChange={handleNameChange}
                        onUrlChange={handleUrlChange}
                        onNameBlur={handleNameBlur}
                        onUrlBlur={handleUrlBlur}
                    />
                ))}
                {/* Adding new references is disabled for now — placeholder only, no add functionality yet. */}
                <Button
                    buttonStyle="primary"
                    type="button"
                    className="scientific-references-section-add-button"
                    disabled={disabled}
                >
                    {HIPPOTHERAPY_PAGE_TEXT.BUTTON.ADD_REFERENCE}
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};

export const ScientificReferencesSection = memo(ScientificReferencesSectionComponent);
