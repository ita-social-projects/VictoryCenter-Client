import './IntroSection.scss';
import background from '../../../../../assets/images/public/partners-page/horses.png';
import { PartnersBanner } from '../../../../../types/public/partners-page';

export interface IntroSectionProps {
    banner: PartnersBanner | null;
}

export const IntroSection = ({ banner }: IntroSectionProps) => {
    const title = banner?.title || '';
    const description = banner?.description || '';
    const imageUrl = banner?.image?.url || background;

    return (
        <div className="partners-intro-block">
            <img src={imageUrl} className="background-img-partners" alt="Horses" />
            <div className="content-overlay">
                <h1 className="main-title">{title}</h1>
                <p className="subtitle">{description}</p>
            </div>
        </div>
    );
};
