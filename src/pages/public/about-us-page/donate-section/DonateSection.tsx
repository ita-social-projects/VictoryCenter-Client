import './DonateSection.scss';
import background from '../../../../assets/images/public/about-us-images/donate-background.jpg';
import { Link } from 'react-router';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';

export const DonateSection = () => {
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
                        <Link to={PUBLIC_ROUTES.ABOUT_US.FULL} className="donate-button" aria-label="Make a donation">
                            {ABOUT_US_DATA.DONATE}
                        </Link>
                        <button className="partner-button" onClick={handlePartner} aria-label="Become a partner">
                            {ABOUT_US_DATA.BECOME_PARTNER}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
