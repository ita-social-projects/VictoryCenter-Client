import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
}

export const TextOnly = ({ title = '', description = '' }: TextOnlyProps) => {
    return (
        <div className={styles.container}>
            <TitleDescriptionSection title={title} description={description} />
        </div>
    );
};
