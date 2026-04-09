import cn from 'classnames';
import { TitleDescriptionSection } from '@/components/common/section-templates/shared/title-description-section/TitleDescriptionSection';
import { SectionMode, SectionTemplate } from '@/types/common/program-sections';
import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
    className?: string;
    mode?: SectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    validationResetKey?: number;
}

export const TextOnly = (props: TextOnlyProps) => {
    const { className = '', mode = SectionMode.View } = props;
    return (
        <TitleDescriptionSection
            {...props}
            template={SectionTemplate.TextOnly}
            className={cn(
                mode === SectionMode.View ? '' : styles.container,
                {
                    [styles.template]: mode === SectionMode.Template,
                    [styles['form-container']]: mode === SectionMode.Edit,
                },
                className,
            )}
            titleClassName={mode === SectionMode.Template ? styles['title-template'] : ''}
            descriptionClassName={mode === SectionMode.Template ? styles['description-template'] : ''}
        />
    );
};
