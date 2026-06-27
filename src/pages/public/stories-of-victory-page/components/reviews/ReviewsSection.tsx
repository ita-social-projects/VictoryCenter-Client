import { useTranslation } from 'react-i18next';
import styles from './ReviewsSection.module.scss';
import { Swiper } from '@/components/public/swiper/Swiper';
import { StoriesOfVictoryReview } from '@/types/public/stories-of-victory';

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

    return (
        <section className={styles.root}>
            <h3 className={styles.titleText}>{t('REVIEWS.TITLE')}</h3>
            <div className={styles.swiper}>
                <Swiper
                    items={content}
                    renderItem={(item) => (
                        <>
                            <div className={styles.reviewCard}>
                                <p className={styles.review}>"{item.review}"</p>
                                <p className={styles.name}>{item.name}</p>
                            </div>
                        </>
                    )}
                    classNameSwiperSlide={styles[`swiper-slide`]}
                    navigationButtons={SWIPER_NAVIGATION_CONFIG}
                />
            </div>
        </section>
    );
};
