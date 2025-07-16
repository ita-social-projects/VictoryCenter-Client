import './support-section.scss';
import { SUPPORT_TITLE, SUPPORT_DATA } from '../../../const/about-us-page/about-us-page';

export const SupportSection = () => {
    return (
        <div className="support-block">
            <h2 className="support-title">{SUPPORT_TITLE}</h2>
            {SUPPORT_DATA.map(({ img, alt, description }, index) => (
                <div key={alt} className="support-card">
                    <img src={img} alt={alt} />
                    <p className="support-description">{description}</p>
                </div>
            ))}
        </div>
    );
};
