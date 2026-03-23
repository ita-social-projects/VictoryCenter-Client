import styles from './IntroSection.module.scss';
import background from '@/assets/images/horses.webp';
import { PartnersBanner } from '@/types/public/partners-page';
import DOMPurify from 'dompurify';
import { SafeHtml } from '@/components/common/safe-html';

export interface IntroSectionProps {
    banner: PartnersBanner | null;
}

export const IntroSection = ({ banner }: IntroSectionProps) => {
    if (!banner) {
        return null;
    }

    const { title, description, image } = banner;
    const imageUrl = image?.url ?? background;

    const sanitizedTitle = DOMPurify.sanitize(title, {
        ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br'],
        ALLOWED_ATTR: [],
    });

    return (
        <div className={styles['intro-block']}>
            <img src={imageUrl} className={styles['bg-img']} alt="Horses" />
            <div className={styles.overlay}>
                <SafeHtml as="h1" className={styles.title} html={sanitizedTitle} />
                <p className={styles.subtitle}>{description}</p>
            </div>
        </div>
    );
};
