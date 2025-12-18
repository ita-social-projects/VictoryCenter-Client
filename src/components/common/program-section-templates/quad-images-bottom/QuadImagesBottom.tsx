import styles from './QuadImagesBottom.module.scss';

export interface QuadImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
}

export const QuadImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    image3 = '',
    image4 = '',
}: QuadImagesBottomProps) => {
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
                    <div className={styles.imageWrapper3}>
                        <img src={image3} alt="" className={styles.image} />
                    </div>
                    <div className={styles.imageWrapper4}>
                        <img src={image4} alt="" className={styles.image} />
                    </div>
                </div>
            </div>
        </div>
    );
};
