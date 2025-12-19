import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
}

export const TextOnly = ({ title = '', description = '' }: TextOnlyProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h2 className={styles.title}>{title}</h2>
            </div>
            <div className={styles.descriptionSection}>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
    );
};
