import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
    isTemplate?: boolean;
}

export const TextOnly = ({ title = '', description = '', isTemplate = false }: TextOnlyProps) => {
    return (
        <div className={styles.container}>
            <TitleDescriptionSection title={title} description={description} isTemplate={isTemplate} />
        </div>
    );
};
