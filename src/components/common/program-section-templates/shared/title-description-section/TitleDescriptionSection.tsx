import styles from './TitleDescriptionSection.module.scss';
import publishedStyles from './PublishedTitleDescriptionSection.module.scss';
import cn from 'classnames';
import { useId } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT, PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { ProgramSectionMode } from '@/types/common/program-sections';

export interface TitleDescriptionSectionProps {
    title?: string;
    description?: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    validationResetKey?: number;
}

export const TitleDescriptionSection = ({
    title = '',
    description = '',
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    mode = ProgramSectionMode.View,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
}: TitleDescriptionSectionProps) => {
    const idPrefix = useId();
    const {
        titleError,
        descriptionError,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    } = useProgramSectionValidation({
        onTitleChange,
        onDescriptionChange,
        resetKey: validationResetKey,
    });

    const baseStyles = mode === ProgramSectionMode.View ? publishedStyles : styles;

    return (
        <div
            className={cn(
                baseStyles.container,
                {
                    [styles.template]: mode === ProgramSectionMode.Template,
                    [styles['form-container']]: mode === ProgramSectionMode.Edit,
                },
                className,
            )}
        >
            <div className={baseStyles['title-section']}>
                {mode === ProgramSectionMode.Edit ? (
                    <InputWithCharacterLimitGroup
                        label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                        isRequired={true}
                        id={`${idPrefix}-section-title`}
                        name={`${idPrefix}-section-title`}
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        maxLength={PROGRAM_SECTION_VALIDATION.title.max}
                        placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                        className={styles['title-input']}
                        error={titleError}
                    />
                ) : (
                    <h2 className={cn(baseStyles.title, titleClassName)}>{title}</h2>
                )}
            </div>
            <div className={baseStyles['description-section']}>
                {mode === ProgramSectionMode.Edit ? (
                    <TextAreaWithCharacterLimitGroup
                        label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                        isRequired={true}
                        id={`${idPrefix}-section-description`}
                        name={`${idPrefix}-section-description`}
                        value={description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                        rows={10}
                        error={descriptionError}
                        currentLength={getTrimmedInputText(description).length}
                    />
                ) : (
                    <p className={cn(baseStyles.description, descriptionClassName)}>{description}</p>
                )}
            </div>
        </div>
    );
};
