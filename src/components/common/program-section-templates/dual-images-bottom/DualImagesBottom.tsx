import styles from './DualImagesBottom.module.scss';

export interface DualImagesBottomProps {
    // TODO: Add props for title, description, and images
}

export const DualImagesBottom = (props: DualImagesBottomProps) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Template 2</h2>
        </div>
    );
};
