import { Image, ImageValues } from '@/types/common/image';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import styles from './HistoryDualImages.module.scss';

interface HistoryDualImagesProps {
    images: (Image | ImageValues | null)[];
}

export const HistoryDualImages = ({ images }: HistoryDualImagesProps) => {
    const [first, second] = images;
    const src1 = getImageSrc(first);
    const src2 = getImageSrc(second);

    return (
        <div className={styles.grid}>
            {src1 && (
                <div className={styles.cell}>
                    <img src={src1} alt="" className={styles.image} loading="lazy" />
                </div>
            )}
            {src2 && (
                <div className={`${styles.cell} ${styles.elevated}`}>
                    <img src={src2} alt="" className={styles.image} loading="lazy" />
                </div>
            )}
        </div>
    );
};
