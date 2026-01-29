import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '@/const/public/about-us-page';
import { AboutUsContent } from '@/types/public/about-us-page';
import styles from './SupportCard.module.scss';
import cn from 'classnames';
import { SafeHtml } from '@/components/common/safe-html';

interface SupportCardProps {
    card: AboutUsContent;
    index: number;
}

export function SupportCard({ card, index }: SupportCardProps) {
    const { t } = useTranslation('aboutUsPage');
    const supportData = t('SUPPORT_DATA', { returnObjects: true });

    const imageUrl = card.image?.url ?? ABOUT_US_DATA.SUPPORT_DATA[index].IMG;
    const altText = supportData[index].ALT;
    const description = card.description ?? '';

    return (
        <div className={cn(styles[`people-card`], styles[`card-${index + 1}`])}>
            <img src={imageUrl} alt={altText} className={styles.image} />
            <SafeHtml as="p" className={styles.description} html={description} />
        </div>
    );
}
