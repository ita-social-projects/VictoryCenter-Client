import styles from './DualImagesBottom.module.scss';

export interface DualImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
}

export const DualImagesBottom = ({ title = '', description = '', image1 = '', image2 = '' }: DualImagesBottomProps) => {
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
                <div className={styles.imagesGrid}>
                    <div className={styles.imageWrapper1}>
                        <img src={image1} alt="" className={styles.image} />
                    </div>
                    <div className={styles.imageWrapper2}>
                        <img src={image2} alt="" className={styles.image} />
                    </div>
                </div>
            </div>
        </div>
    );
};
