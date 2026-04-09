import cn from 'classnames';
import { TitleDescriptionSection } from '@/components/common/section-templates/shared/title-description-section/TitleDescriptionSection';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
    className?: string;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    validationResetKey?: number;
}

export const TextOnly = (props: TextOnlyProps) => {
    const { className = '', mode = ProgramSectionMode.View } = props;
    return (
        <TitleDescriptionSection
            {...props}
            template={ProgramSectionTemplate.TextOnly}
            className={cn(
                mode === ProgramSectionMode.View ? '' : styles.container,
                {
                    [styles.template]: mode === ProgramSectionMode.Template,
                    [styles['form-container']]: mode === ProgramSectionMode.Edit,
                },
                className,
            )}
            titleClassName={mode === ProgramSectionMode.Template ? styles['title-template'] : ''}
            descriptionClassName={mode === ProgramSectionMode.Template ? styles['description-template'] : ''}
        />
    );
};
