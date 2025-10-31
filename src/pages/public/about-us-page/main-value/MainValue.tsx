import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import './MainValue.scss';
import { Swiper } from '../../../../components/public/swiper/Swiper';

export const MainValues = () => {
    const { t } = useTranslation('aboutUsPage');
    const peopleData = t('PEOPLE_DATA', { returnObjects: true });

    return (
        <div className="main-values-block">
            <div className="main-values-title">
                <h2>
                    {t('MAIN_VALUE.FIRST_PART')}
                    <span>{t('MAIN_VALUE.FIRST_HIGHLIGHT')}</span>
                    {t('MAIN_VALUE.MIDDLE_PART')}
                    <span>{t('MAIN_VALUE.SECOND_HIGHLIGHT')}</span>
                </h2>
            </div>

            <div className="people-block">
                <Swiper
                    items={peopleData}
                    slidesPerView={1}
                    breakpoints={{
                        568: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        1025: { slidesPerView: 4 },
                    }}
                    renderItem={(person, index) => (
                        <div className={`people-card card-${index + 1}`}>
                            <img src={ABOUT_US_DATA.PEOPLE_DATA[index].IMG} alt={person.ALT} />
                            <p className="people-info">{person.INFO}</p>
                        </div>
                    )}
                />
            </div>
            <div className="summary-block">
                <h3 className="summary-text">{t('MAIN_VALUE_DETAILS')}</h3>
            </div>
        </div>
    );
};
