import cn from 'classnames';
import { parseDescriptionList } from '@/utils/functions/formatters/text-formatters';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { CardDescriptionField } from './CardDescriptionField';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { useCardValidation } from '@/hooks/admin/use-section-card-validation/useCardValidation';
import { TitleDescriptionCardData } from './TitleDescriptionCardsSection';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import styles from './TitleDescriptionCardsSection.module.scss';
import {
    getProgramSectionTemplateMaxLength,
    getProgramSectionTemplateMinLength,
} from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';

interface TitleDescriptionCardProps {
    card: TitleDescriptionCardData;
    index: number;
    template?: ProgramSectionTemplate;
    mode?: ProgramSectionMode;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
    validationResetKey?: number;
}

export const TitleDescriptionCard = ({
    card,
    index,
    template = ProgramSectionTemplate.DualTitleDescriptionPairs,
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
}: TitleDescriptionCardProps) => {
    const titleMin = getProgramSectionTemplateMinLength(template, ContentType.Title);
    const titleMax = getProgramSectionTemplateMaxLength(template, ContentType.Title);

    const descriptionMin = getProgramSectionTemplateMinLength(template, ContentType.Description);
    const descriptionMax = getProgramSectionTemplateMaxLength(template, ContentType.Description);

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

    if (mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View) {
        return (
            <div className={cn(styles['td-card'], styles['td-card--editable'])}>
                <div className={styles['title-field']}>
                    <InputWithCharacterLimitGroup
                        label={PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.TEXT}
                        id={`card-title-${index}`}
                        name={`card-title-${index}`}
                        value={card.title}
                        isRequired={true}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        maxLength={titleMax}
                        error={titleError}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.PLACEHOLDER}
                        disabled={mode === ProgramSectionMode.View}
                    />
                </div>

                <div className={styles['description-field']}>
                    <CardDescriptionField
                        label={PROGRAMS_TEXT.SECTION.CARD.FORM.DESCRIPTION.TEXT}
                        id={`card-description-${index}`}
                        name={`card-description-${index}`}
                        value={card.description}
                        isRequired={true}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={descriptionMax}
                        error={descriptionError}
                        placeholder="• "
                        disabled={mode === ProgramSectionMode.View}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles['td-card']}>
            <h3 className={styles['title']}>{card.title || PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.TEXT}</h3>
            <div className={styles['description']}>
                {intro && <p>{intro}</p>}

                {items.length > 0 && (
                    <ul className={styles['description-list']}>
                        {items.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                )}

                {!intro && items.length === 0 && <p>{PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}</p>}
            </div>
        </div>
    );
};
