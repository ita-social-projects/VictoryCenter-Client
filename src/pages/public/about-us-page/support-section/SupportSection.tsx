import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import './SupportSection.scss';

export const SupportSection = () => {
    const { t } = useTranslation('aboutUsPage');
    const supportData = t('SUPPORT_DATA', { returnObjects: true });

    return (
        <div className="support-block">
            <h2 className="support-title">{t('SUPPORT_TITLE')}</h2>
            {supportData.map(({ ALT, DESCRIPTION }, index) => (
                <div key={`${ALT}-${index}`} className="support-card">
                    <img src={ABOUT_US_DATA.SUPPORT_DATA[index].IMG} alt={ALT} />
                    <p className="support-description">{DESCRIPTION}</p>
                </div>
            ))}
        </div>
    );
};
