import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { StaggeredImagesGrid } from '../shared/staggered-images-grid/StaggeredImagesGrid';
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
            <TitleDescriptionSection title={title} description={description} className={styles.topSection} />
            <StaggeredImagesGrid images={[image1, image2]} className={styles.bottomSection} />
        </div>
    );
};
