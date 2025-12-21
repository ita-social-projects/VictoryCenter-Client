import styles from './StaggeredImagesGrid.module.scss';

export interface StaggeredImagesGridProps {
    images: string[];
    className?: string;
}

export const StaggeredImagesGrid = ({ images, className = '' }: StaggeredImagesGridProps) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.imagesGrid} style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}>
                {images.map((image, index) => (
                    <div key={index} className={`${styles.imageWrapper} ${index % 2 === 0 ? styles.elevated : ''}`}>
                        <img src={image} alt="" className={styles.image} />
                    </div>
                ))}
            </div>
        </div>
    );
};
