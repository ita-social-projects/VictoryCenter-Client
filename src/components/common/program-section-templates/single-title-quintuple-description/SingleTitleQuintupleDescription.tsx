import cn from 'classnames';
import { useMemo } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import {
    PROGRAMS_TEXT,
    PROGRAM_SECTION_VALIDATION,
    SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG,
} from '@/const/admin/programs';
import { ProgramSectionMode } from '@/types/common/program-sections';
import baseStyles from './SingleTitleQuintupleDescription.module.scss';
import previewStyles from './SingleTitleQuintupleDescription-preview.module.scss';

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

export const SingleTitleQuintupleDescription = ({
    title = '',
    descriptions = [],
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionsChange,
    className,
}: SingleTitleQuintupleDescriptionProps) => {
    const descriptionsCount = SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG.descriptionsCount;

    const normalizedDescriptions = useMemo(
        () => Array.from({ length: descriptionsCount }, (_, i) => descriptions[i] ?? ''),
        [descriptions, descriptionsCount],
    );

    const descriptionOrder = useMemo(() => {
        if (mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View) {
            return DESCRIPTION_LAYOUT.editable;
        }

        return normalizedDescriptions.map((_, index) => index);
    }, [mode, normalizedDescriptions]);

    const rootClassName = cn(
        baseStyles.container,
        {
            [baseStyles.template]: mode === ProgramSectionMode.Template,
            [baseStyles.editable]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
        },
        className,
    );

    return (
        <div className={rootClassName}>
            {mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View ? (
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
                            maxLength={PROGRAM_SECTION_VALIDATION.title.max}
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
                                maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                                rows={4}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={previewStyles['preview-layout']}>
                    <div className={previewStyles['preview-title-block']}>
                        <h2 className={previewStyles['preview-title-text']}>{title}</h2>
                    </div>

                    {descriptionOrder.map((index) => (
                        <div key={index} className={cn(previewStyles['preview-card'], previewStyles[`card-${index}`])}>
                            <p className={previewStyles['preview-text']}>{normalizedDescriptions[index]}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
