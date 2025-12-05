import './IntroSection.scss';
import background from '../../../../../assets/images/public/partners-page/horses.png';
import { PartnersBanner } from '../../../../../types/public/partners-page';
import { PARTNERS_PAGE_TITLE } from '../../../../../const/public/partners-page';

export interface IntroSectionProps {
    banner: PartnersBanner | null;
}

export const IntroSection = ({ banner }: IntroSectionProps) => {
    const description = banner?.description || '';
    const imageUrl = banner?.image?.url || background;

    return (
        <div className="partners-intro-block">
            <img src={imageUrl} className="background-img-partners" alt="Horses" />
            <div className="content-overlay">
                <h1 className="main-title">
                    <div className="title-line">
                        {PARTNERS_PAGE_TITLE.FIRST_LINE.REGULAR}
                        <span className="bold-text">{PARTNERS_PAGE_TITLE.FIRST_LINE.BOLD}</span>
                    </div>
                    <div className="title-line">
                        <span className="bold-text">{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_START}</span>
                        {PARTNERS_PAGE_TITLE.SECOND_LINE.REGULAR}
                        <span className="bold-text">{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_END}</span>
                    </div>
                </h1>
                <p className="subtitle">{description}</p>
            </div>
        </div>
    );
};
