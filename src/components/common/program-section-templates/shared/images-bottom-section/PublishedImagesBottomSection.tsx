import { Swiper } from '@/components/public/swiper/Swiper';
import { ImageValues, Image } from '@/types/common/image';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import styles from './PublishedImagesBottomSection.module.scss';

interface PublishedImagesBottomSectionProps {
    images: (Image | ImageValues | null)[];
    elevatedIndices: number[];
}

export const PublishedImagesBottomSection = ({ images, elevatedIndices }: PublishedImagesBottomSectionProps) => {
    return (
        <div className={styles['bottom-section']}>
            <Swiper
                items={images}
                renderItem={(image, index) => {
                    const imageSrc = getImageSrc(image);
                    return (
                        <div
                            className={styles['image-wrapper']}
                            data-elevated={elevatedIndices.includes(index) ? 'true' : undefined}
                            data-testid="image-wrapper"
                        >
                            {imageSrc && (
                                <img src={imageSrc} alt={`Program section ${index + 1}`} className={styles.image} />
                            )}
                        </div>
                    );
                }}
                slidesPerView="auto"
                breakpoints={{
                    320: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 'auto' },
                }}
            />
        </div>
    );
};
