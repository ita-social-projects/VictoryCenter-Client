import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

export const TextOnly = ({
    title = '',
    description = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: TextOnlyProps) => {
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTitleChange?.(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDescriptionChange?.(e.target.value);
    };

    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
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
                        maxLength={60}
                        placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                    />
                ) : (
                    <h2 className={styles.title}>{title}</h2>
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
                        maxLength={600}
                        rows={8}
                    />
                ) : (
                    <p className={styles.description}>{description}</p>
                )}
            </div>
        </div>
    );
};
