import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { StaggeredImagesGrid } from '../shared/staggered-images-grid/StaggeredImagesGrid';
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
            <TitleDescriptionSection title={title} description={description} className={styles.topSection} />
            <StaggeredImagesGrid images={[image1, image2, image3, image4]} className={styles.bottomSection} />
        </div>
    );
};
