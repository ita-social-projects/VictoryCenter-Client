import { useEffect, useRef } from 'react';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import './ScientificReferenceCard.scss';

export interface ScientificReferenceCardProps {
    localId: string;
    name: string;
    url: string;
    autoFocus?: boolean;
    canDelete?: boolean;
    nameError?: string;
    urlError?: string;
    disabled?: boolean;
    isExpanded: boolean;
    onToggleExpand: (localId: string) => void;
    onNameChange: (localId: string, value: string) => void;
    onUrlChange: (localId: string, value: string) => void;
    onNameBlur: (localId: string) => void;
    onUrlBlur: (localId: string) => void;
}

export const ScientificReferenceCard = ({
    localId,
    name,
    url,
    autoFocus = false,
    canDelete = true,
    nameError,
    urlError,
    disabled,
    isExpanded,
    onToggleExpand,
    onNameChange,
    onUrlChange,
    onNameBlur,
    onUrlBlur,
}: ScientificReferenceCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoFocus && cardRef.current) {
            const textarea = cardRef.current.querySelector('textarea');
            textarea?.focus();
        }
    }, [autoFocus]);

    return (
        <div ref={cardRef} className="scientific-reference-card">
            {/* Delete is disabled for now — placeholders only, no functionality yet. */}
            <div className="scientific-reference-card-top-row">
                <button
                    type="button"
                    className="scientific-reference-card-expand-button"
                    aria-label={isExpanded ? 'Collapse reference' : 'Expand reference'}
                    onClick={() => onToggleExpand(localId)}
                    disabled={disabled}
                >
                    {isExpanded ? <CrossIcon /> : <ArrowIcon className="scientific-reference-card-arrow-icon" />}
                </button>
                {canDelete && (
                    <IconButton
                        type="button"
                        className="scientific-reference-card-delete-button"
                        aria-label="Delete reference"
                        DefaultIcon={ACTION_ICONS.delete.default}
                        FilledIcon={ACTION_ICONS.delete.hover}
                        disabled={disabled}
                    />
                )}
            </div>

            <div className="scientific-reference-card-body">
                <TextAreaWithCharacterLimitGroup
                    label={HIPPOTHERAPY_PAGE_TEXT.LABEL.CITATION_NAME}
                    isRequired
                    id={`hippotherapy-research-citation-${localId}-name`}
                    name={`hippotherapy-research-citation-${localId}-name`}
                    value={name}
                    onChange={(event) => onNameChange(localId, event.target.value)}
                    onBlur={() => onNameBlur(localId)}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.RESEARCH_CITATION_NAME}
                    error={nameError}
                    disabled={disabled}
                    rows={2}
                    autoGrow
                    maxRows={6}
                />
                {isExpanded && (
                    <InputWithCharacterLimitGroup
                        label={HIPPOTHERAPY_PAGE_TEXT.LABEL.CITATION_URL}
                        isRequired
                        id={`hippotherapy-research-citation-${localId}-url`}
                        name={`hippotherapy-research-citation-${localId}-url`}
                        value={url}
                        onChange={(event) => onUrlChange(localId, event.target.value)}
                        onBlur={() => onUrlBlur(localId)}
                        maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.RESEARCH_CITATION_URL}
                        error={urlError}
                        disabled={disabled}
                    />
                )}
            </div>
        </div>
    );
};
