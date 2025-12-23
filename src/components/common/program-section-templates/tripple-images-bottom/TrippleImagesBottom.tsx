import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import styles from './TrippleImagesBottom.module.scss';

export interface TrippleImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    isTemplate?: boolean;
}

export const TrippleImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    image3 = '',
    isTemplate = false,
}: TrippleImagesBottomProps) => {
    const images = [image1, image2, image3];

    return (
        <div className={styles.container}>
            <TitleDescriptionSection
                title={title}
                description={description}
                className={styles.topSection}
                isTemplate={isTemplate}
            />
            <div className={styles.bottomSection}>
                <div className={styles.imagesGrid}>
                    {images.map((image, index) => (
                        <div key={index} className={`${styles.imageWrapper} ${index % 2 === 0 ? styles.elevated : ''}`}>
                            <img src={image} alt="" className={styles.image} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
