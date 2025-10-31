import background from '../../../../assets/images/public/about-us-page/background.jpg';
import { useTranslation } from 'react-i18next';
import './IntroSection.scss';

export const AboutUsIntro = () => {
    const { t } = useTranslation('aboutUsPage');

    return (
        <section className="about-us-block">
            <img src={background} className="background-img" alt="Men and Horse" />
            <img src={background} className="color-overlay" alt="Men and Horse" />
            <div className="about-us-info">
                <h1 className="about-us-main-title">
                    <span className="highlighted">{t('INTRO_TITLE.FIRST_HIGHLIGHT')}</span>
                    {t('INTRO_TITLE.MIDDLE_PART')}
                    <span className="highlighted">{t('INTRO_TITLE.SECOND_HIGHLIGHT')}</span>
                </h1>
                <p className="title-details">{t('INTRO_DETAILS')}</p>
            </div>
        </section>
    );
};
