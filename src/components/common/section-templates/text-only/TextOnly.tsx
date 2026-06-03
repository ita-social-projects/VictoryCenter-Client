import cn from 'classnames';
import { TitleDescriptionSection } from '@/components/common/section-templates/shared/title-description-section/TitleDescriptionSection';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
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
    const { className, mode = SectionMode.View, ...rest } = props;
    const isView = mode === SectionMode.View;
    const isTemplate = mode === SectionMode.Template;
    const isEdit = mode === SectionMode.Edit;
    const rootClassName = cn(className, {
        [styles.container]: !isView,
        [styles.template]: isTemplate,
        [styles['form-container']]: isEdit,
    });
    const titleClassName = cn({
        [styles['title-template']]: isTemplate,
    });
    const descriptionClassName = cn({
        [styles['description-template']]: isTemplate,
    });
    return (
        <TitleDescriptionSection
            {...rest}
            mode={mode}
            template={SectionTemplate.TextOnly}
            className={rootClassName}
            titleClassName={titleClassName}
            descriptionClassName={descriptionClassName}
        />
    );
};
