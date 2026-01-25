import cn from 'classnames';
import { useMemo } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import {
    PROGRAMS_TEXT,
    PROGRAM_SECTION_VALIDATION,
    SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG,
} from '@/const/admin/programs';
import baseStyles from './SingleTitleQuintupleDescription.module.scss';
import previewStyles from './SingleTitleQuintupleDescription-preview.module.scss';

export interface SingleTitleQuintupleDescriptionProps {
    title?: string;
    descriptions?: string[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionsChange?: (index: number, value: string) => void;
    className?: string;
}

export const SingleTitleQuintupleDescription = ({
    title = '',
    descriptions = [],
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionsChange,
    className,
}: SingleTitleQuintupleDescriptionProps) => {
    const descriptionsCount = SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG.descriptionsCount;

    const normalizedDescriptions = useMemo(
        () => Array.from({ length: descriptionsCount }, (_, i) => descriptions[i] ?? ''),
        [descriptions, descriptionsCount],
    );

    const rootClassName = cn(
        baseStyles.container,
        {
            [baseStyles.template]: isTemplate && !isEditable,
            [baseStyles.editable]: isEditable,
        },
        className,
    );

    if (isEditable) {
        const editableOrder = [1, 2, 0, 3, 4];

        return (
            <div className={rootClassName}>
                <div className={baseStyles.editableGrid}>
                    <div className={baseStyles.titleCell}>
                        <InputWithCharacterLimitGroup
                            className={baseStyles.titleInputGroup}
                            label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                            isRequired={true}
                            id="single-title-quintuple-title"
                            name="single-title-quintuple-title"
                            value={title}
                            onChange={(e) => onTitleChange?.(e.target.value)}
                            maxLength={PROGRAM_SECTION_VALIDATION.title.max}
                            placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                        />
                    </div>

                    {editableOrder.map((index) => (
                        <div key={index} className={baseStyles.descriptionCard}>
                            <TextAreaWithCharacterLimitGroup
                                className={baseStyles.descriptionInputGroup}
                                label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                                isRequired={true}
                                id={`single-title-quintuple-desc-${index}`}
                                name={`single-title-quintuple-desc-${index}`}
                                value={normalizedDescriptions[index]}
                                onChange={(e) => onDescriptionsChange?.(index, e.target.value)}
                                maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                                rows={4}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const previewOrder = [0, 1, 2, 3, 4];

    return (
        <div className={rootClassName}>
            <div className={previewStyles.previewLayout}>
                <div className={previewStyles.previewTitleBlock}>
                    <h2 className={previewStyles.previewTitleText}>{title}</h2>
                </div>

                {previewOrder.map((index) => (
                    <div key={index} className={cn(previewStyles.previewCard, previewStyles[`card${index}`])}>
                        <p className={previewStyles.previewText}>{normalizedDescriptions[index]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
