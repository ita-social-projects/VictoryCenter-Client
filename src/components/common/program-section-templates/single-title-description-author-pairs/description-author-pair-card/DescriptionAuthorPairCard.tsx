import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import styles from './DescriptionAuthorPairCard.module.scss';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';

export interface DescriptionAuthorPairCardProps {
    description: string;
    author: string;
    index: number;
    isEditable: boolean;
    onDescriptionChange?: (index: number, value: string) => void;
    onAuthorChange?: (index: number, value: string) => void;
    onDelete?: (index: number) => void;
}

const TEMPLATE = ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs;

export const DescriptionAuthorPairCard = ({
    description,
    author,
    index,
    isEditable,
    onDescriptionChange,
    onAuthorChange,
    onDelete,
}: DescriptionAuthorPairCardProps) => {
    const descriptionId = `pair-description-${index}`;
    const authorId = `pair-author-${index}`;

    const descriptionMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Description);
    const authorMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Author);

    const handleDelete = () => onDelete?.(index);
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onDescriptionChange?.(index, e.target.value);
    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => onAuthorChange?.(index, e.target.value);

    if (!isEditable) {
        return (
            <div className={styles.card}>
                <p className={styles.description}>{description}</p>
                <p className={styles.author}>{author}</p>
            </div>
        );
    }

    return (
        <div className={cn(styles.card, styles.editable)}>
            {index > 0 && (
                <button type="button" className={styles['delete-button']} onClick={handleDelete} aria-label="delete">
                    <DeleteIcon />
                </button>
            )}

            <div className={styles.fields}>
                <div className={styles['description-field']}>
                    <TextAreaWithCharacterLimitGroup
                        className={styles['description-input-group']}
                        label={PROGRAMS_TEXT.SECTION.CARD.FORM.DESCRIPTION.TEXT}
                        isRequired
                        id={descriptionId}
                        name={descriptionId}
                        value={description}
                        onChange={handleDescriptionChange}
                        maxLength={descriptionMaxLength}
                        rows={4}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.DESCRIPTION.PLACEHOLDER}
                    />
                </div>

                <div className={styles['author-field']}>
                    <InputWithCharacterLimitGroup
                        className={styles['author-input-group']}
                        label={PROGRAMS_TEXT.SECTION.CARD.FORM.AUTHOR.TEXT}
                        isRequired
                        id={authorId}
                        name={authorId}
                        value={author}
                        onChange={handleAuthorChange}
                        maxLength={authorMaxLength}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.AUTHOR.PLACEHOLDER}
                    />
                </div>
            </div>
        </div>
    );
};
