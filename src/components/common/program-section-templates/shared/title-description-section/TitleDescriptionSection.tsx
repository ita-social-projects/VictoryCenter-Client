import styles from './TitleDescriptionSection.module.scss';
import publishedStyles from './PublishedTitleDescriptionSection.module.scss';
import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT, PROGRAM_SECTION_TEMPLATE_VALIDATION } from '@/const/admin/programs';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

const getTemplateMaxLength = (template: ProgramSectionTemplate, type: ContentType): number => {
    const rules = (PROGRAM_SECTION_TEMPLATE_VALIDATION as any)[template];
    const max = rules?.lengths?.[type]?.max ?? rules?.lengths?.[String(type)]?.max;

    if (typeof max !== 'number') {
        throw new Error(`Missing max length rule for template=${String(template)} type=${String(type)}`);
    }

    return max;
};

export interface TitleDescriptionSectionProps {
    template: ProgramSectionTemplate;
    title?: string;
    description?: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    mode?: ProgramSectionMode;
    isPublishing?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

export const TitleDescriptionSection = ({
    template,
    title = '',
    description = '',
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    mode = ProgramSectionMode.Published,
    isPublishing = false,
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
        template,
        isPublishing,
        onTitleChange,
        onDescriptionChange,
    });

    const baseStyles = mode === ProgramSectionMode.Published ? publishedStyles : styles;

    const titleMaxLength = getTemplateMaxLength(template, ContentType.Title);
    const descriptionMaxLength = getTemplateMaxLength(template, ContentType.Description);

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
                        maxLength={titleMaxLength}
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
                        maxLength={descriptionMaxLength}
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
