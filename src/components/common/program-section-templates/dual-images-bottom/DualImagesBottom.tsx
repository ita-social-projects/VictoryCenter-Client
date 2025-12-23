import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import styles from './DualImagesBottom.module.scss';

export interface DualImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    isTemplate?: boolean;
}

export const DualImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    isTemplate = false,
}: DualImagesBottomProps) => {
    const images = [image1, image2];

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
