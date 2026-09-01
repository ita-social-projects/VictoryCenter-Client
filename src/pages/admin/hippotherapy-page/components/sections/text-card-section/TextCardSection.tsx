import { memo } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { HippotherapyTextCardContent } from '@/types/admin/hippotherapy-page';
import './TextCardSection.scss';

export interface TextCardSectionProps {
    value: HippotherapyTextCardContent;
    onChange: (value: HippotherapyTextCardContent) => void;
    fieldIdPrefix: string;
    disabled?: boolean;
}

const TextCardSectionComponent = ({ value, onChange, fieldIdPrefix, disabled }: TextCardSectionProps) => {
    const title = useValidatedRichTextField({
        value: value.title,
        onChange: (title) => onChange({ ...value, title }),
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
    });

    const description = useValidatedRichTextField({
        value: value.description,
        onChange: (description) => onChange({ ...value, description }),
    });

    return (
        <div className="hippotherapy-text-card-section">
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                isRequired
                id={`${fieldIdPrefix}-title`}
                name={`${fieldIdPrefix}-title`}
                value={value.title}
                onChange={title.handleChange}
                onBlur={title.handleBlur}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_TITLE}
                error={title.error}
                disabled={disabled}
            />
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                isRequired
                id={`${fieldIdPrefix}-description`}
                name={`${fieldIdPrefix}-description`}
                value={value.description}
                onChange={description.handleChange}
                onBlur={description.handleBlur}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION}
                error={description.error}
                disabled={disabled}
            />
        </div>
    );
};

export const TextCardSection = memo(TextCardSectionComponent);
