import styles from './IntroSection.module.scss';
import background from '@/assets/images/public/partners-page/horses.png';
import { PartnersBanner } from '@/types/public/partners-page';
import { PARTNERS_PAGE_TITLE } from '@/const/public/partners-page';

export interface IntroSectionProps {
    banner: PartnersBanner | null;
}

export const IntroSection = ({ banner }: IntroSectionProps) => {
    const description = banner?.description || '';
    const imageUrl = banner?.image?.url || background;

    return (
        <div className={styles['intro-block']}>
            <img src={imageUrl} className={styles['bg-img']} alt="Horses" />
            <div className={styles.overlay}>
                <h1 className={styles.title}>
                    <div className={styles['title-line']}>
                        {PARTNERS_PAGE_TITLE.FIRST_LINE.REGULAR}
                        <span className={styles.bold}>{PARTNERS_PAGE_TITLE.FIRST_LINE.BOLD}</span>
                    </div>
                    <div className={styles['title-line']}>
                        <span className={styles.bold}>{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_START}</span>
                        {PARTNERS_PAGE_TITLE.SECOND_LINE.REGULAR}
                        <span className={styles.bold}>{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_END}</span>
                    </div>
                </h1>
                <p className={styles.subtitle}>{description}</p>
            </div>
        </div>
    );
};
