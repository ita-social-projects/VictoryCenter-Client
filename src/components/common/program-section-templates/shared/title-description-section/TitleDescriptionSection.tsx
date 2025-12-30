import styles from './TitleDescriptionSection.module.scss';
import cn from 'classnames';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PROGRAMS_TEXT } from '@/const/admin/programs';

export interface TitleDescriptionSectionProps {
    title?: string;
    description?: string;
    className?: string;
    templateStyles?: Record<string, string>;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

export const TitleDescriptionSection = ({
    title = '',
    description = '',
    className = '',
    templateStyles,
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: TitleDescriptionSectionProps) => {
    const cx = (name: string) => cn(styles[name as keyof typeof styles], templateStyles?.[name]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTitleChange?.(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDescriptionChange?.(e.target.value);
    };

    return (
        <div
            className={cn(
                cx('container'),
                {
                    [cx('template')]: isTemplate,
                    [cx('editable')]: isEditable,
                },
                className,
            )}
        >
            <div className={cx('title-section')}>
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
                        className={cx('title-input')}
                    />
                ) : (
                    <h2 className={cx('title')}>{title}</h2>
                )}
            </div>
            <div className={cx('description-section')}>
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
                    <p className={cx('description')}>{description}</p>
                )}
            </div>
        </div>
    );
};
