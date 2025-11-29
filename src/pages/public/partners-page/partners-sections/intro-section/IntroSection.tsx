import styles from './IntroSection.module.scss';
import background from '../../../../../assets/images/public/partners-page/horses.png';
import { PARTNERS_PAGE_SUBTITLE, PARTNERS_PAGE_TITLE } from '../../../../../const/public/partners-page';

export const IntroSection = () => {
    return (
        <div className={styles['partners-intro-block']}>
            <img src={background} className={styles['background-img-partners']} alt="Horses" />
            <div className={styles['content-overlay']}>
                <h1 className={styles['main-title']}>
                    <div className={styles['title-line']}>
                        {PARTNERS_PAGE_TITLE.FIRST_LINE.REGULAR}
                        <span className={styles['bold-text']}>{PARTNERS_PAGE_TITLE.FIRST_LINE.BOLD}</span>
                    </div>
                    <div className={styles['title-line']}>
                        <span className={styles['bold-text']}>{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_START}</span>
                        {PARTNERS_PAGE_TITLE.SECOND_LINE.REGULAR}
                        <span className={styles['bold-text']}>{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_END}</span>
                    </div>
                </h1>
                <p className={styles['subtitle']}>{PARTNERS_PAGE_SUBTITLE}</p>
            </div>
        </div>
    );
};
