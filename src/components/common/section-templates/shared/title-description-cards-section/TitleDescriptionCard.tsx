import { useId } from 'react';
import cn from 'classnames';
import { parseDescriptionList } from '@/utils/functions/formatters/text-formatters';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { CardDescriptionField } from './CardDescriptionField';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useCardValidation } from '@/hooks/admin/use-section-card-validation/useCardValidation';
import { TitleDescriptionCardData } from './TitleDescriptionCardsSection';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import styles from './TitleDescriptionCardsSection.module.scss';
import {
    getSectionTemplateMaxLength,
    getSectionTemplateMinLength,
} from '@/utils/functions/section-template-validation/sectionTemplateValidation';

interface TitleDescriptionCardProps {
    card: TitleDescriptionCardData;
    index: number;
    template: SectionTemplate;
    mode?: SectionMode;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
    validationResetKey?: number;
}

export const TitleDescriptionCard = ({
    card,
    index,
    template,
    mode = SectionMode.View,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
}: TitleDescriptionCardProps) => {
    const titleMin = getSectionTemplateMinLength(template, ContentType.Title);
    const titleMax = getSectionTemplateMaxLength(template, ContentType.Title);

    const descriptionMin = getSectionTemplateMinLength(template, ContentType.Description);
    const descriptionMax = getSectionTemplateMaxLength(template, ContentType.Description);

    const idPrefix = useId();
    const {
        error: titleError,
        handleChange: handleTitleChange,
        handleBlur: handleTitleBlur,
    } = useCardValidation({
        value: card.title,
        onChange: (v) => onTitleChange?.(index, v),
        min: titleMin,
        max: titleMax,
        required: true,
        resetKey: validationResetKey,
    });

    const {
        error: descriptionError,
        handleChange: handleDescriptionChange,
        handleBlur: handleDescriptionBlur,
    } = useCardValidation({
        value: card.description,
        onChange: (v) => onDescriptionChange?.(index, v),
        min: descriptionMin,
        max: descriptionMax,
        required: true,
        resetKey: validationResetKey,
    });

    const { intro, items } = parseDescriptionList(card.description);

    if (mode === SectionMode.Edit) {
        return (
            <div className={cn(styles['td-card'], styles['td-card--editable'])}>
                <div className={styles['title-field']}>
                    <InputWithCharacterLimitGroup
                        label={PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.TEXT}
                        id={`${idPrefix}-card-title-${index}`}
                        name={`${idPrefix}-card-title-${index}`}
                        value={card.title}
                        isRequired={true}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        maxLength={titleMax}
                        error={titleError}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.PLACEHOLDER}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleMax)}
                        showCounterBelow={true}
                    />
                </div>

                <div className={styles['description-field']}>
                    <CardDescriptionField
                        label={PROGRAMS_TEXT.SECTION.CARD.FORM.DESCRIPTION.TEXT}
                        id={`${idPrefix}-card-description-${index}`}
                        name={`${idPrefix}-card-description-${index}`}
                        value={card.description}
                        isRequired={true}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={descriptionMax}
                        error={descriptionError}
                        placeholder="• "
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles['td-card']}>
            <h3
                className={cn(styles['title'], {
                    [styles['title--template']]: mode === SectionMode.Template,
                })}
            >
                {card.title || PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.TEXT}
            </h3>
            <div
                className={cn(styles['description'], {
                    [styles['description--template']]: mode === SectionMode.Template,
                })}
            >
                {intro && <p>{intro}</p>}

                {items.length > 0 && (
                    <ul className={styles['description-list']}>
                        {items.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                )}

                {!intro && items.length === 0 && <p>{SECTIONS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}</p>}
            </div>
        </div>
    );
};
