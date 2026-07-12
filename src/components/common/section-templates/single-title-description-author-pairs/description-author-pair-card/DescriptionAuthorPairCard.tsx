import cn from 'classnames';
import { useCallback, useState } from 'react';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import styles from './DescriptionAuthorPairCard.module.scss';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { getSectionTemplateMaxLength } from '@/utils/functions/section-template-validation/sectionTemplateValidation';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';

export interface DescriptionAuthorPairCardProps {
    description: string;
    author: string;
    index: number;
    isEditable: boolean;
    canDelete?: boolean;
    onDescriptionChange?: (index: number, value: string) => void;
    onAuthorChange?: (index: number, value: string) => void;
    onDelete?: (index: number) => void;
}

const TEMPLATE = SectionTemplate.SingleTitleDescriptionAuthorPairs;

export const DescriptionAuthorPairCard = ({
    description,
    author,
    index,
    isEditable,
    canDelete = false,
    onDescriptionChange,
    onAuthorChange,
    onDelete,
}: DescriptionAuthorPairCardProps) => {
    const descriptionId = `pair-description-${index}`;
    const authorId = `pair-author-${index}`;

    const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
    const [authorError, setAuthorError] = useState<string | undefined>(undefined);

    const descriptionMaxLength = getSectionTemplateMaxLength(TEMPLATE, ContentType.Description);
    const authorMaxLength = getSectionTemplateMaxLength(TEMPLATE, ContentType.Author);

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

    const handleAuthorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const v = e.target.value;
        onAuthorChange?.(index, v);

        if (authorError !== undefined) {
            setAuthorError(validate(v, ContentType.Author));
        }
    };

    const handleDescriptionBlur = () => {
        setDescriptionError(validate(description, ContentType.Description));
    };

    const handleAuthorBlur = () => {
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
            {canDelete && (
                <IconButton
                    type="button"
                    className={styles['delete-button']}
                    onClick={handleDelete}
                    aria-label="delete"
                    DefaultIcon={ACTION_ICONS.delete.default}
                    FilledIcon={ACTION_ICONS.delete.hover}
                />
            )}

            <div className={styles.fields}>
                <div className={styles['description-field']}>
                    <TextAreaWithCharacterLimitGroup
                        className={styles['description-input-group']}
                        label={SECTIONS_TEXT.SECTION.CARD.FORM.DESCRIPTION.TEXT}
                        isRequired
                        id={descriptionId}
                        name={descriptionId}
                        value={description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={descriptionMaxLength}
                        rows={2}
                        placeholder={SECTIONS_TEXT.SECTION.CARD.FORM.DESCRIPTION.PLACEHOLDER}
                        error={descriptionError}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionMaxLength)}
                        autoGrow={false}
                    />
                </div>

                <div className={styles['author-field']}>
                    <TextAreaWithCharacterLimitGroup
                        className={styles['author-input-group']}
                        label={SECTIONS_TEXT.SECTION.CARD.FORM.AUTHOR.TEXT}
                        isRequired
                        id={authorId}
                        name={authorId}
                        value={author}
                        onChange={handleAuthorChange}
                        onBlur={handleAuthorBlur}
                        maxLength={authorMaxLength}
                        placeholder={SECTIONS_TEXT.SECTION.CARD.FORM.AUTHOR.PLACEHOLDER}
                        error={authorError}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(authorMaxLength)}
                        rows={1}
                        autoGrow={false}
                        maxRows={4}
                    />
                </div>
            </div>
        </div>
    );
};
