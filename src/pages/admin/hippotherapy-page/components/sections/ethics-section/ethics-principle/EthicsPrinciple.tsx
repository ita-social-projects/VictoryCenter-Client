import { memo } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS } from '@/const/admin/hippotherapy-page';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';

export interface EthicsPrincipleProps {
    value: string;
    fieldId: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const EthicsPrincipleComponent = ({ value, fieldId, onChange, disabled }: EthicsPrincipleProps) => {
    const principle = useValidatedRichTextField({ value, onChange });

    return (
        <div className="hippotherapy-ethics-section-principle">
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                isRequired
                id={fieldId}
                name={fieldId}
                value={value}
                onChange={principle.handleChange}
                onBlur={principle.handleBlur}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.ETHICS_PRINCIPLE}
                error={principle.error}
                disabled={disabled}
            />
        </div>
    );
};

export const EthicsPrinciple = memo(EthicsPrincipleComponent);
