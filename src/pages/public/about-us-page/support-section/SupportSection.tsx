import './SupportSection.scss';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

export const SupportSection = () => {
    return (
        <div className="support-block">
            <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
            {ABOUT_US_DATA.SUPPORT_DATA.map(({ IMG, ALT, DESCRIPTION }, index) => (
                <div key={ALT} className="support-card">
                    <img src={IMG} alt={ALT} />
                    <p className="support-description">{DESCRIPTION}</p>
                </div>
            ))}
        </div>
    );
};
