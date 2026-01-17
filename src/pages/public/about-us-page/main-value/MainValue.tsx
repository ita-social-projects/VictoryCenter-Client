import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '@/const/public/about-us-page';
import styles from './MainValue.module.scss';
import { Swiper } from '@/components/public/swiper/Swiper';
import { AboutUsContent } from '@/types/public/about-us-page';
import classNames from 'classnames';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';
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

            <div className={styles.peopleBlock}>
                <Swiper
                    items={content}
                    renderItem={(person, index) => {
                        const imageUrl = person.image?.url ?? ABOUT_US_DATA.PEOPLE_DATA[index].IMG;
                        const altText = peopleData[index].ALT;
                        const description = person.description;

                        return (
                            <div className={classNames(styles.peopleCard, styles[`card${index + 1}`])}>
                                <img className={styles.peopleImg} src={imageUrl} alt={altText} />
                                <p className={styles.peopleInfo}>{description}</p>
                            </div>
                        );
                    }}
                    classNameSwiperSlide={styles.swiperSlide}
                    navigationButtons={{
                        prev: {
                            icon: ArrowLeft,
                            ariaLabel: 'back',
                            variant: 'primary-dark',
                            className: styles.left,
                        },
                        next: {
                            icon: ArrowRight,
                            ariaLabel: 'next',
                            variant: 'primary-dark',
                            className: styles.right,
                        },
                    }}
                />
            </div>
            <div className={styles.summaryBlock}>
                <div className={styles.summaryLine} />
                <h3 className={styles.summaryText}>{t('MAIN_VALUE_DETAILS')}</h3>
            </div>
        </div>
    );
};
