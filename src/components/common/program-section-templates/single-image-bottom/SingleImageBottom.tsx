import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import styles from './SingleImageBottom.module.scss';

export interface SingleImageBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    isTemplate?: boolean;
}

export const SingleImageBottom = ({
    title = '',
    description = '',
    image1 = '',
    isTemplate = false,
}: SingleImageBottomProps) => {
    return (
        <div className={styles.container}>
            <TitleDescriptionSection
                title={title}
                description={description}
                className={styles.topSection}
                isTemplate={isTemplate}
            />
            <div className={styles.bottomSection}>
                <div className={styles.imageWrapper}>
                    <img src={image1} alt="" className={styles.image} />
                </div>
            </div>
        </div>
    );
};
