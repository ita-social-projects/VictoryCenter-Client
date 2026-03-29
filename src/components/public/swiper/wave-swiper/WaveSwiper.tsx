import { Swiper } from '@/components/public/swiper/Swiper';
import styles from './WaveSwiper.module.scss';

const SWIPER_NAVIGATION_CONFIG = {
    prev: {
        className: styles.left,
    },
    next: {
        className: styles.right,
    },
};

interface WaveSwiperProps<SwiperItem> {
    items: SwiperItem[] | null;
    renderItemCallback: (item: SwiperItem, index: number) => React.ReactNode;
}

export function WaveSwiper<SwiperItem>({ items, renderItemCallback }: WaveSwiperProps<SwiperItem>) {
    return (
        <div className={styles.root}>
            <Swiper
                items={items}
                renderItem={renderItemCallback}
                classNameSwiperSlide={styles[`swiper-slide`]}
                navigationButtons={SWIPER_NAVIGATION_CONFIG}
            />
        </div>
    );
}
