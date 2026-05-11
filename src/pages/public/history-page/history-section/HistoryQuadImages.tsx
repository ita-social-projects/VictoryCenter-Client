import { Image, ImageValues } from '@/types/common/image';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import styles from './HistoryQuadImages.module.scss';

interface HistoryQuadImagesProps {
    images: (Image | ImageValues | null)[];
}

export const HistoryQuadImages = ({ images }: HistoryQuadImagesProps) => {
    return (
        <div className={styles.grid}>
            {images.map((image, index) => {
                const src = getImageSrc(image);
                if (!src) return null;
                return (
                    <div key={index} className={`${styles.cell} ${index % 2 === 1 ? styles.elevated : ''}`}>
                        <img src={src} alt="" className={styles.image} loading="lazy" />
                    </div>
                );
            })}
        </div>
    );
};
