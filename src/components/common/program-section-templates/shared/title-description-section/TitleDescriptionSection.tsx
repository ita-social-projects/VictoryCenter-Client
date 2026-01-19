import styles from './TitleDescriptionSection.module.scss';
import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT, PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';

export interface TitleDescriptionSectionProps {
    title?: string;
    description?: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

export const TitleDescriptionSection = ({
    title = '',
    description = '',
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    isTemplate = false,
    isEditable = false,
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

    return (
        <div
            className={cn(
                styles.container,
                {
                    [styles.template]: isTemplate,
                    [styles.editable]: isEditable,
                },
                className,
            )}
        >
            <div className={styles['title-section']}>
                {isEditable ? (
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
                    />
                ) : (
                    <h2 className={cn(styles.title, titleClassName)}>{title}</h2>
                )}
            </div>
            <div className={styles['description-section']}>
                {isEditable ? (
                    <TextAreaWithCharacterLimitGroup
                        label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                        isRequired={true}
                        id="section-description"
                        name="section-description"
                        value={description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                        rows={8}
                        error={descriptionError}
                        currentLength={getTrimmedInputText(description).length}
                    />
                ) : (
                    <p className={cn(styles.description, descriptionClassName)}>{description}</p>
                )}
            </div>
        </div>
    );
};
