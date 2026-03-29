import { WaveSwiper } from '@/components/public/swiper/wave-swiper/WaveSwiper';
import { MainValueCard } from '@/pages/public/about-us-page/main-value/main-value-card/MainValueCard';
import { HIPPOTHERAPY_ADVANTAGES } from '@/const/public/hippotherapy-page';
import { HippotherapyAdvantage, HippotherapyAdvantagesSection } from '@/types/public/hippotherapy-page';
import styles from './Advantages.module.scss';

export const Advantages = ({ title, advantages }: HippotherapyAdvantagesSection) => {
    const renderSwiperItem = (card: HippotherapyAdvantage, index: number) => {
        const imageUrl = card.imgURL ?? HIPPOTHERAPY_ADVANTAGES.IMAGES[index];
        const altText = card.imgAlternativeText;

        return <MainValueCard description={card.text} index={index} imageUrl={imageUrl} altText={altText} />;
    };

    return (
        <section className={styles.root}>
            <h2 className={styles.title}>{title}</h2>
            <WaveSwiper items={advantages} renderItemCallback={renderSwiperItem} />
        </section>
    );
};
