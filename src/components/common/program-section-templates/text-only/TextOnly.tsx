import { TitleDescriptionSection } from '@/components/common/program-section-templates/shared/title-description-section/TitleDescriptionSection';
import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
    className?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

export const TextOnly = (props: TextOnlyProps) => {
    return <TitleDescriptionSection {...props} />;
};
