import './DonateSection.scss';
import background from '../../../assets/images/public/about-us-images/donate-background.png';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

export const DonateSection = () => {
    const handleDonate = () => {
        // TODO: implementation of making donations
    };

    const handlePartner = () => {
        // TODO: implementation of becoming a partner
    };

    return (
        <div className="donate-block">
            <img src={background} alt="Background horses" className="donate-background" />
            <div className="donate-info-block">
                <h2 className="donate-title">{ABOUT_US_DATA.DONATE_TITLE}</h2>
                <div className="donate-details">
                    <h3>{ABOUT_US_DATA.DONATE_DETAILS}</h3>
                    <div className="donate-buttons">
                        <button className="donate-button" onClick={handleDonate} aria-label="Make a donation">
                            {ABOUT_US_DATA.DONATE}
                        </button>
                        <button className="partner-button" onClick={handlePartner} aria-label="Become a partner">
                            {ABOUT_US_DATA.BECOME_PARTNER}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
