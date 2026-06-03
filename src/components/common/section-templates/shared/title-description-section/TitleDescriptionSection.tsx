import styles from './TitleDescriptionSection.module.scss';
import viewStyles from './ViewTitleDescriptionSection.module.scss';
import cn from 'classnames';
import { useId } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useSectionValidation } from '@/hooks/admin/use-section-validation';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { getSectionTemplateMaxLength } from '@/utils/functions/section-template-validation/sectionTemplateValidation';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';

export interface TitleDescriptionSectionProps {
    template: SectionTemplate;
    title?: string;
    description?: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    mode?: SectionMode;
    isPublishing?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    validationResetKey?: number;
}

export const TitleDescriptionSection = ({
    template,
    title = '',
    description = '',
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    mode = SectionMode.View,
    isPublishing = false,
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
    } = useSectionValidation({
        template,
        isPublishing,
        onTitleChange,
        onDescriptionChange,
        resetKey: validationResetKey,
    });

    const baseStyles = mode === SectionMode.View ? viewStyles : styles;

    const titleMaxLength = getSectionTemplateMaxLength(template, ContentType.Title);
    const descriptionMaxLength = getSectionTemplateMaxLength(template, ContentType.Description);

    return (
        <div
            className={cn(
                baseStyles.container,
                {
                    [styles.template]: mode === SectionMode.Template,
                    [styles['form-container']]: mode === SectionMode.Edit,
                },
                className,
            )}
        >
            <div className={baseStyles['title-section']}>
                {mode === SectionMode.Edit ? (
                    <InputWithCharacterLimitGroup
                        label={SECTIONS_TEXT.SECTION.FORM.TITLE.TEXT}
                        isRequired={true}
                        id={`${idPrefix}-section-title`}
                        name={`${idPrefix}-section-title`}
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        maxLength={titleMaxLength}
                        rows={1}
                        autoGrow={true}
                        maxRows={3}
                        placeholder={SECTIONS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                        className={styles['title-input']}
                        error={titleError}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleMaxLength)}
                        showCounterBelow={true}
                    />
                ) : (
                    <h2 className={cn(baseStyles.title, titleClassName)}>{title}</h2>
                )}
            </div>

            <div className={baseStyles['description-section']}>
                {mode === SectionMode.Edit ? (
                    <TextAreaWithCharacterLimitGroup
                        label={SECTIONS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                        isRequired={true}
                        id={`${idPrefix}-section-description`}
                        name={`${idPrefix}-section-description`}
                        value={description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={descriptionMaxLength}
                        rows={10}
                        autoGrow={true}
                        maxRows={24}
                        error={descriptionError}
                        currentLength={getTrimmedInputText(description).length}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionMaxLength)}
                    />
                ) : (
                    <p className={cn(baseStyles.description, descriptionClassName)}>{description}</p>
                )}
            </div>
        </div>
    );
};
