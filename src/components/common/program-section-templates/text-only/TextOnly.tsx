import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    title?: string;
    description?: string;
    image1?: string;
}

export const TextOnly = ({ title = '', description = '', image1 = '' }: TextOnlyProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.imageWrapper}>
                    <img src={image1} alt="" className={styles.image} />
                </div>
            </div>
            <div className={styles.bottomSection}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>{title}</h2>
                </div>
                <div className={styles.descriptionSection}>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>
        </div>
    );
};
