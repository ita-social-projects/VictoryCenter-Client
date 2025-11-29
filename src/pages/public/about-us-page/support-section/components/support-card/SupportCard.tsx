import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { AboutUsContent } from '../../../../../../types/public/about-us-page';

interface SupportDataItem {
    ALT: string;
}

interface SupportCardProps {
    card: AboutUsContent;
    index: number;
    stylesModule: Record<string, string>;
}

export function SupportCard({ card, index, stylesModule }: SupportCardProps) {
    const { t } = useTranslation('aboutUsPage');
    const supportData = t('SUPPORT_DATA', { returnObjects: true }) as SupportDataItem[];

    const imageUrl = card.image?.url ?? ABOUT_US_DATA.SUPPORT_DATA[index].IMG;
    const altText = supportData[index]?.ALT ?? '';
    const description = card.description;
    const cardClassName = `${stylesModule['support-card']} ${stylesModule[`card-${index + 1}`]}`;

    return (
        <div className={cardClassName}>
            <img src={imageUrl} alt={altText} />
            <p className={stylesModule['support-description']}>{description}</p>
        </div>
    );
}
