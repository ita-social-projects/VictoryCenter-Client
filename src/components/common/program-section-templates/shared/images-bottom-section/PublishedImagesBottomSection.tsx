import cn from 'classnames';
import { Swiper } from '@/components/public/swiper/Swiper';
import { ImageValues, Image } from '@/types/common/image';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { ImagesBottomSectionConfig } from './ImagesBottomSection';
import styles from './PublishedImagesBottomSection.module.scss';

interface PublishedImagesBottomSectionProps {
    images: (Image | ImageValues | null)[];
    config: ImagesBottomSectionConfig;
    bottomSectionClassName?: string;
    imageWrapperClassName?: string;
}

export const PublishedImagesBottomSection = ({
    images,
    config,
    bottomSectionClassName = '',
    imageWrapperClassName = '',
}: PublishedImagesBottomSectionProps) => {
    return (
        <div className={cn(styles['bottom-section'], bottomSectionClassName)}>
            <Swiper
                items={images}
                renderItem={(image, index) => {
                    const imageSrc = getImageSrc(image);
                    return (
                        <div
                            className={cn(styles['image-wrapper'], imageWrapperClassName)}
                            data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                            data-testid="image-wrapper"
                        >
                            {imageSrc && (
                                <img src={imageSrc} alt={`Program section ${index + 1}`} className={styles.image} />
                            )}
                        </div>
                    );
                }}
                slidesPerView="auto"
                breakpoints={config.swiperBreakpoints}
            />
        </div>
    );
};
