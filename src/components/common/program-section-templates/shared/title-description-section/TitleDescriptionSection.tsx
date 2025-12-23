import styles from './TitleDescriptionSection.module.scss';
import cn from 'classnames';

export interface TitleDescriptionSectionProps {
    title?: string;
    description?: string;
    className?: string;
    isTemplate?: boolean;
}

export const TitleDescriptionSection = ({
    title = '',
    description = '',
    className = '',
    isTemplate = false,
}: TitleDescriptionSectionProps) => {
    return (
        <div className={cn(styles.container, className, { [styles.template]: isTemplate })}>
            <div className={styles['title-section']}>
                <h2 className={styles.title}>{title}</h2>
            </div>
            <div className={styles['description-section']}>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
    );
};
