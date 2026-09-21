import { Image, ImageValues } from '@/types/common/image';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import styles from './HistoryTripleImages.module.scss';

interface HistoryTripleImagesProps {
    images: (Image | ImageValues | null)[];
}

const ELEVATED_INDICES = [0, 2];

export const HistoryTripleImages = ({ images }: HistoryTripleImagesProps) => {
    return (
        <div className={styles.grid}>
            {images.slice(0, 3).map((image, index) => {
                const src = getImageSrc(image);
                if (!src) return null;
                return (
                    <div
                        key={index}
                        className={`${styles.cell} ${ELEVATED_INDICES.includes(index) ? styles.elevated : ''}`}
                    >
                        <img src={src} alt="" className={styles.image} loading="lazy" />
                    </div>
                );
            })}
        </div>
    );
};
