import cn from 'classnames';
import { useMemo } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT, SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG } from '@/const/admin/programs';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import baseStyles from './SingleTitleQuintupleDescription.module.scss';
import viewStyles from './ViewSingleTitleQuintupleDescription.module.scss';

export interface SingleTitleQuintupleDescriptionProps {
    title?: string;
    descriptions?: string[];
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionsChange?: (index: number, value: string) => void;
    className?: string;
}

const DESCRIPTION_LAYOUT = {
    editable: [0, 1, 2, 3, 4],
} as const;

const TEMPLATE = ProgramSectionTemplate.SingleTitleQuintupleDescription;

export const SingleTitleQuintupleDescription = ({
    title = '',
    descriptions = [],
    mode = ProgramSectionMode.View,
    onTitleChange,
    onDescriptionsChange,
    className,
}: SingleTitleQuintupleDescriptionProps) => {
    const descriptionsCount = SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG.descriptionsCount;

    const titleMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Title);
    const descriptionMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Description);

    const normalizedDescriptions = useMemo(
        () => Array.from({ length: descriptionsCount }, (_, i) => descriptions[i] ?? ''),
        [descriptions, descriptionsCount],
    );

    const descriptionOrder = useMemo(() => {
        if (mode === ProgramSectionMode.Edit) {
            return DESCRIPTION_LAYOUT.editable;
        }

        return normalizedDescriptions.map((_, index) => index);
    }, [mode, normalizedDescriptions]);

    const rootClassName = cn(
        baseStyles.container,
        {
            [baseStyles.template]: mode === ProgramSectionMode.Template,
            [baseStyles.editable]: mode === ProgramSectionMode.Edit,
        },
        className,
    );

    return (
        <div className={rootClassName}>
            {mode === ProgramSectionMode.Edit ? (
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
                            />
                        </div>
                    ))}
                </div>
            ) : mode === ProgramSectionMode.Template ? (
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
