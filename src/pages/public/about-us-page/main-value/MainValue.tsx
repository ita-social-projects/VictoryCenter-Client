import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import styles from './MainValue.module.scss';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import { AboutUsContent } from '../../../../types/public/about-us-page';

export interface MainValuesProps {
    content: AboutUsContent[] | null;
}

interface PeopleDataItem {
    ALT: string;
}

const SWIPER_CONFIG = {
    slidesPerView: 1,
    breakpoints: {
        568: { slidesPerView: 2 },
        768: { slidesPerView: 2 },
        1025: { slidesPerView: 4 },
    },
} as const;

const renderPeopleCard = (
    person: AboutUsContent,
    index: number,
    peopleData: PeopleDataItem[],
    stylesModule: Record<string, string>,
) => {
    const imageUrl = person.image?.url ?? ABOUT_US_DATA.PEOPLE_DATA[index].IMG;
    const altText = peopleData[index]?.ALT ?? '';
    const description = person.description;
    const cardClassName = `${stylesModule['people-card']} ${stylesModule[`card-${index + 1}`]}`;

    return (
        <div className={cardClassName}>
            <img src={imageUrl} alt={altText} />
            <p className={stylesModule['people-info']}>{description}</p>
        </div>
    );
};

export const MainValues = ({ content }: MainValuesProps) => {
    const { t } = useTranslation('aboutUsPage');
    const peopleData = t('PEOPLE_DATA', { returnObjects: true }) as PeopleDataItem[];

    return (
        <div className={styles['main-values-block']}>
            <div className={styles['main-values-title']}>
                <h2>
                    {t('MAIN_VALUE.FIRST_PART')}
                    <span>{t('MAIN_VALUE.FIRST_HIGHLIGHT')}</span>
                    {t('MAIN_VALUE.MIDDLE_PART')}
                    <span>{t('MAIN_VALUE.SECOND_HIGHLIGHT')}</span>
                </h2>
            </div>

            <div className={styles['people-block']}>
                <Swiper
                    items={content}
                    {...SWIPER_CONFIG}
                    stylesModule={styles}
                    renderItem={(person, index) => renderPeopleCard(person, index, peopleData, styles)}
                />
            </div>

            <div className={styles['summary-block']}>
                <h3 className={styles['summary-text']}>{t('MAIN_VALUE_DETAILS')}</h3>
            </div>
        </div>
    );
};
