import cn from 'classnames';
import { useCallback, useState } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import styles from './DescriptionAuthorPairCard.module.scss';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';

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

    const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
    const [authorError, setAuthorError] = useState<string | undefined>(undefined);

    const descriptionMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Description);
    const authorMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Author);

    const validate = useCallback((value: string, type: ContentType) => {
        return PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(value, type, true, TEMPLATE);
    }, []);

    const handleDelete = () => onDelete?.(index);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const v = e.target.value;
        onDescriptionChange?.(index, v);

        if (descriptionError !== undefined) {
            setDescriptionError(validate(v, ContentType.Description));
        }
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        onAuthorChange?.(index, v);

        if (authorError !== undefined) {
            setAuthorError(validate(v, ContentType.Author));
        }
    };

    const handleDescriptionBlur = () => {
        if (!isEditable) return;
        setDescriptionError(validate(description, ContentType.Description));
    };

    const handleAuthorBlur = () => {
        if (!isEditable) return;
        setAuthorError(validate(author, ContentType.Author));
    };

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
                        onBlur={handleDescriptionBlur}
                        maxLength={descriptionMaxLength}
                        rows={4}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.DESCRIPTION.PLACEHOLDER}
                        error={descriptionError}
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
                        onBlur={handleAuthorBlur}
                        maxLength={authorMaxLength}
                        placeholder={PROGRAMS_TEXT.SECTION.CARD.FORM.AUTHOR.PLACEHOLDER}
                        error={authorError}
                    />
                </div>
            </div>
        </div>
    );
};
