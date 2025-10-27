import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { AboutUsContent } from '../../../../../../types/public/about-us-page';

interface SupportCardProps {
    card: AboutUsContent;
    index?: number;
}

export function SupportCard({ card, index = 0 }: SupportCardProps) {
    const imageUrl = card.image?.url ?? ABOUT_US_DATA.SUPPORT_DATA[index].IMG;
    const altText = ABOUT_US_DATA.SUPPORT_DATA[index].ALT;
    const description = card.description;

    return (
        <div key={index} className={`support-card card-${index + 1}`}>
            <img src={imageUrl} alt={altText} />
            <p className="support-description">{description}</p>
        </div>
    );
}
