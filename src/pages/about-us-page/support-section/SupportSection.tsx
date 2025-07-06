import './support-section.scss';
import { SUPPORT_TITLE, SUPPORT_DATA } from '../../../const/about-us-page/about-us-page';

export const SupportSection = () => {
    return (
        <div className="support-block">
            <h2 className="support-title">{SUPPORT_TITLE}&nbsp;</h2>
            {SUPPORT_DATA.map(({ img, alt, description }, index) => (
                <div key={index} className="support-card">
                    <img src={img} alt={alt} />
                    <p className="support-description">
                        {description}&nbsp;
                    </p>
                </div>
            ))}
        </div>
    );
};
