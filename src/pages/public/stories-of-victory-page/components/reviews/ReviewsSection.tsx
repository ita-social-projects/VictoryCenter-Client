import { useTranslation } from 'react-i18next';
import { Swiper } from '@/components/public/swiper/Swiper';
import { ReviewCard } from './ReviewCard';
import { StoriesOfVictoryReview } from '@/types/public/stories-of-victory';
import styles from './ReviewsSection.module.scss';

export interface StoriesOfVictorySectionProps {
    content: StoriesOfVictoryReview[] | null;
}

const SWIPER_NAVIGATION_CONFIG = {
    prev: {
        className: styles.left,
    },
    next: {
        className: styles.right,
    },
};

export const ReviewsSection = ({ content }: StoriesOfVictorySectionProps) => {
    const { t } = useTranslation('successPage');

    if (!content || content.length === 0) return null;

    return (
        <section className={styles.root}>
            <h3 className={styles.titleText}>{t('REVIEWS.TITLE')}</h3>
            <div className={styles.swiper}>
                <Swiper
                    items={content}
                    renderItem={(item) => <ReviewCard item={item} />}
                    classNameSwiperSlide={styles[`swiper-slide`]}
                    navigationButtons={SWIPER_NAVIGATION_CONFIG}
                />
            </div>
        </section>
    );
};
