import './donate-section.scss';
import background from '../../../assets/about-us-images/images/donate-background.jpg';
import { routes } from '../../../const/routers/routes';
import { DONATE_TITLE, DONATE_DETAILS, DONATE, BECOME_PARTNER } from '../../../const/about-us-page/about-us-page';
import { Link } from 'react-router';

export const DonateSection = () => {
    const handlePartner = () => {
        // TODO: implementation of becoming a partner
    };

    return (
        <div className="donate-block">
            <img src={background} alt="Background horses" className="donate-background" />
            <div className="donate-info-block">
                <h2 className="donate-title">{DONATE_TITLE}</h2>
                <div className="donate-details">
                    <h3>{DONATE_DETAILS}</h3>
                    <div className="donate-buttons">
                        <Link to={routes.donatePageRoute} className="donate-button" aria-label="Make a donation">
                            {DONATE}
                        </Link>
                        <button className="partner-button" onClick={handlePartner} aria-label="Become a partner">
                            {BECOME_PARTNER}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
