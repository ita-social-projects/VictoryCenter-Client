import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import styles from './QuadImagesBottom.module.scss';

export interface QuadImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    isTemplate?: boolean;
}

export const QuadImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    image3 = '',
    image4 = '',
    isTemplate = false,
}: QuadImagesBottomProps) => {
    const images = [image1, image2, image3, image4];

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
                        <div key={index} className={`${styles.imageWrapper} ${index % 2 === 1 ? styles.elevated : ''}`}>
                            <img src={image} alt="" className={styles.image} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
