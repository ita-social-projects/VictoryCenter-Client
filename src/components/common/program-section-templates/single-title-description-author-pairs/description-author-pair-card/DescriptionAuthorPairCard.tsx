import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT, PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';
import styles from './DescriptionAuthorPairCard.module.scss';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';

export interface DescriptionAuthorPairCardProps {
    description: string;
    author: string;
    index: number;
    isEditable: boolean;
    onDescriptionChange?: (index: number, value: string) => void;
    onAuthorChange?: (index: number, value: string) => void;
    onDelete?: (index: number) => void;
}

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
                        maxLength={PROGRAM_SECTION_VALIDATION.cardDescription.max}
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
                        maxLength={PROGRAM_SECTION_VALIDATION.cardAuthor.max}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.AUTHOR.PLACEHOLDER}
                    />
                </div>
            </div>
        </div>
    );
};
