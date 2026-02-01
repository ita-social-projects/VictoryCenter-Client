import cn from 'classnames';
import { Swiper } from '@/components/public/swiper/Swiper';
import { ImageValues, Image } from '@/types/common/image';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { ImagesBottomSectionConfig } from './ImagesBottomSection';
import styles from './PublishedImagesBottomSection.module.scss';
import swiperStyles from './ImagesBottomSwiper.module.scss';

interface PublishedImagesBottomSectionProps {
    images: (Image | ImageValues | null)[];
    config: ImagesBottomSectionConfig;
    bottomSectionClassName?: string;
    imageWrapperClassName?: string;
    imageClassName?: string;
}

const SWIPER_NAVIGATION_CONFIG = {
    prev: {
        className: swiperStyles.left,
    },
    next: {
        className: swiperStyles.right,
    },
};

export const PublishedImagesBottomSection = ({
    images,
    config,
    bottomSectionClassName = '',
    imageWrapperClassName = '',
    imageClassName = '',
}: PublishedImagesBottomSectionProps) => {
    return (
        <div className={cn(styles['bottom-section'], bottomSectionClassName)}>
            <div className={swiperStyles.swiperContainer}>
                <Swiper
                    items={images}
                    renderItem={(image, index) => {
                        const imageSrc = getImageSrc(image);
                        return (
                            <div
                                className={cn(styles['image-wrapper'], imageWrapperClassName)}
                                data-testid="image-wrapper"
                            >
                                {imageSrc && (
                                    <img
                                        src={imageSrc}
                                        alt={`Program section ${index + 1}`}
                                        className={cn(styles.image, imageClassName)}
                                        data-elevated={config.elevatedIndices.includes(index) ? 'true' : 'false'}
                                    />
                                )}
                            </div>
                        );
                    }}
                    slidesPerView="auto"
                    breakpoints={config.swiperBreakpoints}
                    classNameSwiperSlide={swiperStyles.swiperSlide}
                    navigationButtons={SWIPER_NAVIGATION_CONFIG}
                />
            </div>
        </div>
    );
};
