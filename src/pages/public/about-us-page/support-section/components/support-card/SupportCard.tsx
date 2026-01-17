import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '@/const/public/about-us-page';
import { AboutUsContent } from '@/types/public/about-us-page';
import styles from './SupportCard.module.scss';
import classNames from 'classnames';

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

    return (
        <div className={classNames(styles.peopleCard, styles[`card${index + 1}`])}>
            <img src={imageUrl} alt={altText} className={styles.image} />
            <p className={styles.description}>{description}</p>
        </div>
    );
}
