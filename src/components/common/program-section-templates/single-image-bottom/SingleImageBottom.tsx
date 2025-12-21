import styles from './SingleImageBottom.module.scss';

export interface SingleImageBottomProps {
    title?: string;
    description?: string;
    image1?: string;
}

export const SingleImageBottom = ({ title = '', description = '', image1 = '' }: SingleImageBottomProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>{title}</h2>
                </div>
                <div className={styles.descriptionSection}>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>
            <div className={styles.bottomSection}>
                <div className={styles.imageWrapper}>
                    <img src={image1} alt="" className={styles.image} />
                </div>
            </div>
        </div>
    );
};
