import cn from 'classnames';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT, SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import baseStyles from './SingleTitleQuintupleDescription.module.scss';
import viewStyles from './ViewSingleTitleQuintupleDescription.module.scss';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';

export interface SingleTitleQuintupleDescriptionProps {
    title?: string;
    descriptions?: string[];
    mode?: SectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionsChange?: (index: number, value: string) => void;
    className?: string;
    validationResetKey?: number;
}

const DESCRIPTION_LAYOUT = {
    editable: [0, 1, 2, 3, 4],
} as const;

const TEMPLATE = SectionTemplate.SingleTitleQuintupleDescription;

export const SingleTitleQuintupleDescription = ({
    title = '',
    descriptions = [],
    mode = SectionMode.View,
    onTitleChange,
    onDescriptionsChange,
    className,
    validationResetKey,
}: SingleTitleQuintupleDescriptionProps) => {
    const descriptionsCount = SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG.descriptionsCount;

    const titleMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Title);
    const descriptionMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Description);

    const normalizedDescriptions = useMemo(
        () => Array.from({ length: descriptionsCount }, (_, i) => descriptions[i] ?? ''),
        [descriptions, descriptionsCount],
    );

    const descriptionOrder = useMemo(() => {
        if (mode === SectionMode.Edit) {
            return DESCRIPTION_LAYOUT.editable;
        }

        return normalizedDescriptions.map((_, index) => index);
    }, [mode, normalizedDescriptions]);

    const rootClassName = cn(
        baseStyles.container,
        {
            [baseStyles.template]: mode === SectionMode.Template,
            [baseStyles.editable]: mode === SectionMode.Edit,
        },
        className,
    );

    const [errors, setErrors] = useState<{
        title?: string;
        descriptions: Record<number, string | undefined>;
    }>({
        title: undefined,
        descriptions: {},
    });

    useEffect(() => {
        setErrors({
            title: undefined,
            descriptions: {},
        });
    }, [validationResetKey]);

    const handleTitleBlur = useCallback(() => {
        const error = PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(title, true, TEMPLATE);
        setErrors((prev) => ({ ...prev, title: error }));
    }, [title]);

    const handleDescriptionBlur = useCallback(
        (index: number) => {
            const error = PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(
                normalizedDescriptions[index],
                true,
                TEMPLATE,
            );
            setErrors((prev) => ({
                ...prev,
                descriptions: {
                    ...prev.descriptions,
                    [index]: error,
                },
            }));
        },
        [normalizedDescriptions],
    );

    return (
        <div className={rootClassName}>
            {mode === SectionMode.Edit ? (
                <div className={baseStyles['editable-grid']}>
                    <div className={baseStyles['title-cell']}>
                        <InputWithCharacterLimitGroup
                            className={baseStyles['title-input-group']}
                            label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                            isRequired
                            id="single-title-quintuple-title"
                            name="single-title-quintuple-title"
                            value={title}
                            onChange={(e) => onTitleChange?.(e.target.value)}
                            maxLength={titleMaxLength}
                            placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                            error={errors.title}
                            onBlur={handleTitleBlur}
                            maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleMaxLength)}
                            showCounterBelow={true}
                        />
                    </div>

                    {descriptionOrder.map((index) => (
                        <div key={index} className={baseStyles['description-card']}>
                            <TextAreaWithCharacterLimitGroup
                                className={baseStyles['description-input-group']}
                                label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                                isRequired
                                id={`single-title-quintuple-desc-${index}`}
                                name={`single-title-quintuple-desc-${index}`}
                                value={normalizedDescriptions[index]}
                                onChange={(e) => onDescriptionsChange?.(index, e.target.value)}
                                maxLength={descriptionMaxLength}
                                rows={4}
                                autoGrow={true}
                                maxRows={16}
                                error={errors.descriptions[index]}
                                onBlur={() => handleDescriptionBlur(index)}
                                maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionMaxLength)}
                            />
                        </div>
                    ))}
                </div>
            ) : mode === SectionMode.Template ? (
                <div className={baseStyles['template-layout']}>
                    <div className={baseStyles['template-title-block']}>
                        <h2 className={baseStyles['template-title-text']}>{title}</h2>
                    </div>

                    {descriptionOrder.map((index) => (
                        <div key={index} className={cn(baseStyles['template-card'], baseStyles[`card-${index}`])}>
                            <p className={baseStyles['template-text']}>{normalizedDescriptions[index]}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={viewStyles['view-layout']}>
                    <div className={viewStyles['view-title-block']}>
                        <h2 className={viewStyles['view-title-text']}>{title}</h2>
                    </div>

                    {descriptionOrder.map((index) => (
                        <div key={index} className={cn(viewStyles['view-card'], viewStyles[`card-${index}`])}>
                            <p className={viewStyles['view-text']}>{normalizedDescriptions[index]}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
