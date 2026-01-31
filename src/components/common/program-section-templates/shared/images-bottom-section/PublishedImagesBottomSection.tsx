import cn from 'classnames';
import { Swiper } from '@/components/public/swiper/Swiper';
import { ImageValues, Image } from '@/types/common/image';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { ImagesBottomSectionConfig } from './ImagesBottomSection';
import styles from './PublishedImagesBottomSection.module.scss';
import swiperStyles from './PublishedImagesBottomSwiper.module.scss';

interface PublishedImagesBottomSectionProps {
    images: (Image | ImageValues | null)[];
    config: ImagesBottomSectionConfig;
    bottomSectionClassName?: string;
    imageWrapperClassName?: string;
    imageClassName?: string;
}

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
                                data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                                data-testid="image-wrapper"
                            >
                                {imageSrc && (
                                    <img
                                        src={imageSrc}
                                        alt={`Program section ${index + 1}`}
                                        className={cn(styles.image, imageClassName)}
                                    />
                                )}
                            </div>
                        );
                    }}
                    slidesPerView="auto"
                    breakpoints={config.swiperBreakpoints}
                    classNameSwiperSlide={swiperStyles.swiperSlide}
                />
            </div>
        </div>
    );
};
