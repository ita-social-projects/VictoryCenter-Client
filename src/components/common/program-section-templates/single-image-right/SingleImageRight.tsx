import styles from './SingleImageRight.module.scss';

export interface SingleImageRightProps {
    title?: string;
    description?: string;
    image1?: string;
}

export const SingleImageRight = ({ title = '', description = '', image1 = '' }: SingleImageRightProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>{title}</h2>
                </div>
                <div className={styles.descriptionSection}>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.imageWrapper}>
                    <img src={image1} alt="" className={styles.image} />
                </div>
            </div>
        </div>
    );
};
