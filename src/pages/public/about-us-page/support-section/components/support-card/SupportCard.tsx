import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '@/const/public/about-us-page';
import { AboutUsContent } from '@/types/public/about-us-page';
import DOMPurify from 'dompurify';
import styles from './SupportCard.module.scss';
import cn from 'classnames';

interface SupportCardProps {
    card: AboutUsContent;
    index: number;
}

export function SupportCard({ card, index }: SupportCardProps) {
    const { t } = useTranslation('aboutUsPage');
    const supportData = t('SUPPORT_DATA', { returnObjects: true });

    const imageUrl = card.image?.url ?? ABOUT_US_DATA.SUPPORT_DATA[index].IMG;
    const altText = supportData[index].ALT;
    const description = card.description;

    const sanitizedDescription =
        DOMPurify.sanitize(description ?? card.description ?? '', {
            ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'],
            ALLOWED_ATTR: [],
        }) || '';

    return (
        <div className={cn(styles[`people-card`], styles[`card-${index + 1}`])}>
            <img src={imageUrl} alt={altText} className={styles.image} />
            <p className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
        </div>
    );
}
