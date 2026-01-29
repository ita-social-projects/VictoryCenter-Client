import styles from './TitleDescriptionSection.module.scss';
import publishedStyles from './PublishedTitleDescriptionSection.module.scss';
import cn from 'classnames';
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
}

export const TitleDescriptionSection = ({
    title = '',
    description = '',
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
}: TitleDescriptionSectionProps) => {
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
    });

    const baseStyles = mode === ProgramSectionMode.Published ? publishedStyles : styles;

    return (
        <div
            className={cn(
                baseStyles.container,
                {
                    [styles.template]: mode === ProgramSectionMode.Template,
                    [styles['form-container']]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
                },
                className,
            )}
        >
            <div className={baseStyles['title-section']}>
                {mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View ? (
                    <InputWithCharacterLimitGroup
                        label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                        isRequired={true}
                        id="section-title"
                        name="section-title"
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        maxLength={PROGRAM_SECTION_VALIDATION.title.max}
                        placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                        className={styles['title-input']}
                        error={titleError}
                        disabled={mode === ProgramSectionMode.View}
                    />
                ) : (
                    <h2 className={cn(baseStyles.title, titleClassName)}>{title}</h2>
                )}
            </div>
            <div className={baseStyles['description-section']}>
                {mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View ? (
                    <TextAreaWithCharacterLimitGroup
                        label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                        isRequired={true}
                        id="section-description"
                        name="section-description"
                        value={description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                        rows={10}
                        error={descriptionError}
                        currentLength={getTrimmedInputText(description).length}
                        disabled={mode === ProgramSectionMode.View}
                    />
                ) : (
                    <p className={cn(baseStyles.description, descriptionClassName)}>{description}</p>
                )}
            </div>
        </div>
    );
};
