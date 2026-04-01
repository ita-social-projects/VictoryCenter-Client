import { WaveSwiper } from '@/components/public/swiper/wave-swiper/WaveSwiper';
import { SwipedCard } from '@/components/public/swiper/swiped-card/SwipedCard';
import { HIPPOTHERAPY_SWIPED_IMAGES } from '@/const/public/hippotherapy-page';
import { HippotherapySwipedCard } from '@/types/public/hippotherapy-page';
import styles from './SwipedGallery.module.scss';

interface SwipedGalleryProps {
    title: string;
    cards: HippotherapySwipedCard[];
}

export const SwipedGallery = ({ title, cards }: SwipedGalleryProps) => {
    const renderSwiperItem = (card: HippotherapySwipedCard, index: number) => {
        const imageUrl = card.imgURL ?? HIPPOTHERAPY_SWIPED_IMAGES[index];
        const altText = card.imgAlternativeText;

        return <SwipedCard description={card.text} index={index} imageUrl={imageUrl} altText={altText} />;
    };

    return (
        <section className={styles.root}>
            <h2 className={styles.title}>{title}</h2>
            <WaveSwiper items={cards} renderItemCallback={renderSwiperItem} />
        </section>
    );
};
