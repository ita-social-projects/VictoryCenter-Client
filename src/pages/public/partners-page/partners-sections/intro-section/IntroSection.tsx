import styles from './IntroSection.module.scss';
import background from '@/assets/images/public/partners-page/horses.png';
import { PartnersBanner } from '@/types/public/partners-page';
import { sanitizeHtml } from '@/utils/functions/sanitize-html/sanitizeHtml';

export interface IntroSectionProps {
    banner: PartnersBanner | null;
}

export const IntroSection = ({ banner }: IntroSectionProps) => {
    const title = banner?.title || '';
    const description = banner?.description || '';
    const imageUrl = banner?.image?.url || background;

    const sanitizedTitle = sanitizeHtml(title);

    return (
        <div className={styles['intro-block']}>
            <img src={imageUrl} className={styles['bg-img']} alt="Horses" />
            <div className={styles.overlay}>
                {sanitizedTitle && <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />}
                <p className={styles.subtitle}>{description}</p>
            </div>
        </div>
    );
};
