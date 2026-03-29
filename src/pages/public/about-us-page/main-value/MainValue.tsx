import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '@/const/public/about-us-page';
import styles from './MainValue.module.scss';
import { WaveSwiper } from '@/components/public/swiper/wave-swiper/WaveSwiper';
import { AboutUsContent } from '@/types/public/about-us-page';
import { SwipedCard } from '@/components/public/swiper/swiped-card/SwipedCard';

export interface MainValuesProps {
    content: AboutUsContent[] | null;
}

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
                <WaveSwiper
                    items={content}
                    renderItemCallback={(person, index) => {
                        const imageUrl = person.image?.url ?? ABOUT_US_DATA.PEOPLE_DATA[index].IMG;
                        const altText = peopleData[index].ALT;
                        return (
                            <SwipedCard
                                description={person.description}
                                localizations={person.localizations}
                                index={index}
                                imageUrl={imageUrl}
                                altText={altText}
                            />
                        );
                    }}
                />
            </div>
            <div className={styles[`summary-block`]}>
                <div className={styles[`summary-line`]} />
                <h3 className={styles[`summary-text`]}>{t('MAIN_VALUE_DETAILS')}</h3>
            </div>
        </div>
    );
};
