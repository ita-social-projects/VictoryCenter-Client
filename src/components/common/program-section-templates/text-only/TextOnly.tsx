import { TitleDescriptionSection } from '@/components/common/program-section-templates/shared/title-description-section/TitleDescriptionSection';
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
    return (
        <TitleDescriptionSection
            title={title}
            description={description}
            isTemplate={isTemplate}
            isEditable={isEditable}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            templateStyles={styles}
        />
    );
};
