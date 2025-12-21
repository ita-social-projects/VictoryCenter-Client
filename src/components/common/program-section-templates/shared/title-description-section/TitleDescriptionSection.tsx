import styles from './TitleDescriptionSection.module.scss';

export interface TitleDescriptionSectionProps {
    title?: string;
    description?: string;
    className?: string;
}

export const TitleDescriptionSection = ({
    title = '',
    description = '',
    className = '',
}: TitleDescriptionSectionProps) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.titleSection}>
                <h2 className={styles.title}>{title}</h2>
            </div>
            <div className={styles.descriptionSection}>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
    );
};
