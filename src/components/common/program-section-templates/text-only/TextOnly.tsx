import cn from 'classnames';
import { TitleDescriptionSection } from '@/components/common/program-section-templates/shared/title-description-section/TitleDescriptionSection';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './TextOnly.module.scss';
import publishedStyles from './PublishedTextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
    className?: string;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

export const TextOnly = (props: TextOnlyProps) => {
    const { className = '', mode = ProgramSectionMode.Published } = props;
    const baseStyles = mode === ProgramSectionMode.Published ? publishedStyles : styles;

    return (
        <TitleDescriptionSection
            {...props}
            className={cn(
                baseStyles.container,
                {
                    [styles.template]: mode === ProgramSectionMode.Template,
                    [styles['form-container']]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
                },
                className,
            )}
            titleClassName={mode === ProgramSectionMode.Template ? styles['title-template'] : ''}
            descriptionClassName={mode === ProgramSectionMode.Template ? styles['description-template'] : ''}
        />
    );
};
