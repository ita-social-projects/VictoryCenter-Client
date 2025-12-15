import styles from './OutroSection.module.scss';
import outro from '@/assets/videos/public/partners-page/outro.mp4';
import { OUTRO } from '@/const/public/partners-page';
import { Button } from '@/components/admin/button/Button';

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
                        <Button buttonStyle="primary" className={styles['btn-primary']}>
                            {OUTRO.BUTTON_BECOME_SUPPORT_TEXT}
                        </Button>
                        <Button buttonStyle="secondary" className={styles['btn-secondary']}>
                            {OUTRO.BUTTON_SUPPORT_TEXT}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
