import './donate-section.scss';
import background from '../../../assets/about-us-images/images/donate-background.jpg';
import { DONATE_TITLE, DONATE_DETAILS, DONATE, BECOME_PARTNER } from '../../../const/about-us-page/about-us-page';

export const  DonateSection = () => {

    const handleDonate = () => {
        // TODO: implementation of making donats
    };

    const handlePartner = () => {
        // TODO: implementation of becoming a partner
    };
    
    return (
        <div className="donate-block">
            <img src={background} alt="Background horses" className="donate-background"/>
            <div className="donate-info-block">
                <h2 className="donate-title">{DONATE_TITLE}</h2>
                <div className="donate-details">
                    <h3>{DONATE_DETAILS}</h3>
                    <div className="donate-buttons">
                        <button
                            className="donate-button"
                            onClick={handleDonate}
                            aria-label="Make a donation">{DONATE}</button>
                        <button
                            className="partner-button"
                            onClick={handlePartner}
                            aria-label="Become a partner">{BECOME_PARTNER}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
