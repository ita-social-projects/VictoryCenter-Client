import './SupportSection.scss';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { useTranslation } from 'react-i18next';

export const SupportSection = () => {
    const { t } = useTranslation('aboutUsPage');

    return (
        <div className="support-block">
            <h2 className="support-title">{t('SUPPORT_TITLE')}</h2>
            {ABOUT_US_DATA.SUPPORT_DATA.map(({ IMG, ALT, DESCRIPTION }, index) => (
                <div key={`${ALT}-${index}`} className="support-card">
                    <img src={IMG} alt={ALT} />
                    <p className="support-description">{t(`SUPPORT_DATA[${index}].DESCRIPTION`)}</p>
                </div>
            ))}
        </div>
    );
};
