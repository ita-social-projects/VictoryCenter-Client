import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import styles from './SingleImageTop.module.scss';

export interface SingleImageTopProps {
    title?: string;
    description?: string;
    image1?: string;
    isTemplate?: boolean;
}

export const SingleImageTop = ({
    title = '',
    description = '',
    image1 = '',
    isTemplate = false,
}: SingleImageTopProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.imageWrapper}>
                    <img src={image1} alt="" className={styles.image} />
                </div>
            </div>
            <TitleDescriptionSection
                title={title}
                description={description}
                className={styles.bottomSection}
                isTemplate={isTemplate}
            />
        </div>
    );
};
