import styles from './OutroSection.module.scss';
import outro from '../../../../../assets/videos/public/partners-page/outro.mp4';
import { OUTRO } from '../../../../../const/public/partners-page';

export const OutroSection = () => {
    return (
        <div className={styles['video-background-container']}>
            <video autoPlay muted loop playsInline className={styles['background-video']}>
                <source src={outro} type="video/mp4" />
            </video>

            <div className={styles['quote-overlay-partners']}>
                <h1 className={styles['video-text-partners']}>
                    {OUTRO.TITLE.FIRST_LINE} <br />
                    {OUTRO.TITLE.SECOND_LINE}
                </h1>
                <div>
                    <p className={styles['video-description']}>{OUTRO.TEXT}</p>
                    <div className={styles['video-buttons']}>
                        <button className={styles['btn-primary']}>{OUTRO.BUTTON_BECOME_SUPPORT_TEXT}</button>
                        <button className={styles['btn-secondary']}>{OUTRO.BUTTON_SUPPORT_TEXT}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
