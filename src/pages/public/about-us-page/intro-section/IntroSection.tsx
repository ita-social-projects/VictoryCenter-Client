import background from '../../../../assets/images/public/about-us-page/background.jpg';
// import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import './IntroSection.scss';
import { useTranslation } from 'react-i18next';
import '../../../../i18n';

export const AboutUsIntro = () => {

    const { t } = useTranslation('aboutUsPage');

    return (
        <div className="about-us-block">
            <img src={background} className="background-img" alt="Men and Horse" />
            <img src={background} className="color-overlay" alt="Men and Horse" />
            <h1 className="about-us-main-title">
                <span className="highlighted">{t('INTRO_TITLE.FIRST_HIGHLIGHT')}</span>
                {t('INTRO_TITLE.MIDDLE_PART')}
                <span className="highlighted">{t('INTRO_TITLE.SECOND_HIGHLIGHT')}</span>
            </h1>
            <div className="title-details">
                <p>{t('INTRO_DETAILS.FIRST_LINE')}</p>
                <p>{t('INTRO_DETAILS.SECOND_LINE')}</p>
                <p>{t('INTRO_DETAILS.THIRD_LINE')}</p>
                <p className="paragraph-break">{t('INTRO_DETAILS.FOURTH_LINE')}</p>
                <p>{t('INTRO_DETAILS.FIFTH_LINE')}</p>
            </div>
        </div>
    );
};
