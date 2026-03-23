import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '@/const/public/about-us-page';
import styles from './MainValue.module.scss';
import { Swiper } from '@/components/public/swiper/Swiper';
import { AboutUsContent } from '@/types/public/about-us-page';
import { MainValueCard } from './main-value-card/MainValueCard';

export interface MainValuesProps {
    content: AboutUsContent[] | null;
}

const SWIPER_NAVIGATION_CONFIG = {
    prev: {
        className: styles.left,
    },
    next: {
        className: styles.right,
    },
};

export const MainValues = ({ content }: MainValuesProps) => {
    const { t } = useTranslation('aboutUsPage');
    const peopleData = t('PEOPLE_DATA', { returnObjects: true });

    return (
        <div className={styles.root}>
            <div className={styles.title}>
                <h2>
                    {t('MAIN_VALUE.FIRST_PART')}
                    <span>{t('MAIN_VALUE.FIRST_HIGHLIGHT')}</span>
                    {t('MAIN_VALUE.MIDDLE_PART')}
                    <span>{t('MAIN_VALUE.SECOND_HIGHLIGHT')}</span>
                </h2>
            </div>

            <div className={styles[`people-block`]}>
                <Swiper
                    items={content}
                    renderItem={(person, index) => {
                        const imageUrl = person.image?.url ?? ABOUT_US_DATA.PEOPLE_DATA[index].IMG;
                        const altText = peopleData[index].ALT;

                        return <MainValueCard person={person} index={index} imageUrl={imageUrl} altText={altText} />;
                    }}
                    classNameSwiperSlide={styles[`swiper-slide`]}
                    navigationButtons={SWIPER_NAVIGATION_CONFIG}
                />
            </div>
            <div className={styles[`summary-block`]}>
                <div className={styles[`summary-line`]} />
                <h3 className={styles[`summary-text`]}>{t('MAIN_VALUE_DETAILS')}</h3>
            </div>
        </div>
    );
};
