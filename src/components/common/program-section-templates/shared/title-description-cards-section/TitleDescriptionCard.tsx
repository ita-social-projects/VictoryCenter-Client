import cn from 'classnames';
import { parseDescriptionList } from '@/utils/functions/formatters/text-formatters';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { CardDescriptionField } from './CardDescriptionField';
import { PROGRAM_SECTION_VALIDATION, PROGRAMS_TEXT } from '@/const/admin/programs';
import { useCardValidation } from '@/hooks/admin/use-section-card-validation/useCardValidation';
import { TitleDescriptionCardData } from './TitleDescriptionCardsSection';
import styles from './TitleDescriptionCardsSection.module.scss';

interface TitleDescriptionCardProps {
    card: TitleDescriptionCardData;
    index: number;
    isEditable: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const TitleDescriptionCard = ({
    card,
    index,
    isEditable,
    onTitleChange,
    onDescriptionChange,
}: TitleDescriptionCardProps) => {
    const {
        error: titleError,
        handleChange: handleTitleChange,
        handleBlur: handleTitleBlur,
    } = useCardValidation({
        value: card.title,
        onChange: (v) => onTitleChange?.(index, v),
        min: PROGRAM_SECTION_VALIDATION.cardTitle.min,
        max: PROGRAM_SECTION_VALIDATION.cardTitle.max,
        required: true,
    });

    const {
        error: descriptionError,
        handleChange: handleDescriptionChange,
        handleBlur: handleDescriptionBlur,
    } = useCardValidation({
        value: card.description,
        onChange: (v) => onDescriptionChange?.(index, v),
        min: PROGRAM_SECTION_VALIDATION.cardDescription.min,
        max: PROGRAM_SECTION_VALIDATION.cardDescription.max,
        required: true,
    });

    const { intro, items } = parseDescriptionList(card.description);

    if (isEditable) {
        return (
            <div className={cn(styles.tdCard, styles.tdCardEditable)}>
                <div className={styles.titleField}>
                    <InputWithCharacterLimitGroup
                        label="Заголовок"
                        id={`card-title-${index}`}
                        name={`card-title-${index}`}
                        value={card.title}
                        isRequired={true}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        maxLength={PROGRAM_SECTION_VALIDATION.cardTitle.max}
                        error={titleError}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.TITLE.PLACEHOLDER}
                    />
                </div>

                <div className={styles.descriptionField}>
                    <CardDescriptionField
                        label="Опис"
                        id={`card-description-${index}`}
                        name={`card-description-${index}`}
                        value={card.description}
                        isRequired={true}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={PROGRAM_SECTION_VALIDATION.cardDescription.max}
                        error={descriptionError}
                        placeholder="• "
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tdCard}>
            <h3 className={styles.title}>{card.title || 'Заголовок'}</h3>
            <div className={styles.description}>
                {intro && <p>{intro}</p>}

                {items.length > 0 && (
                    <ul className={styles.descriptionList}>
                        {items.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                )}

                {!intro && items.length === 0 && <p>Опис секції</p>}
            </div>
        </div>
    );
};
