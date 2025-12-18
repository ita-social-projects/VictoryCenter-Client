import styles from './QuadImagesBottom.module.scss';

export interface QuadImagesBottomProps {
    // TODO: Add props for title, description, and images
}

export const QuadImagesBottom = (props: QuadImagesBottomProps) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Template 1</h2>
        </div>
    );
};
