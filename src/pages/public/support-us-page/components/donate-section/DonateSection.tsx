import React from 'react';
import { Button } from '@/components/public/ui/button';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import fallbackImage from '@/assets/images/girl-horse.webp';
import background from '@/assets/videos/child-riding-horse.webm';
import { useTranslation } from 'react-i18next';
import styles from './DonateSection.module.scss';

export const DonateSection: React.FC = () => {
    const { t } = useTranslation('supportUsPage');
    const [isVideoUnavailable, setIsVideoUnavailable] = React.useState(false);

    return (
        <div className={styles['donate-block']}>
            <img className={styles['fallback-image']} src={fallbackImage} alt="" aria-hidden="true" />
            {!isVideoUnavailable && (
                <video autoPlay muted loop playsInline aria-hidden="true" onError={() => setIsVideoUnavailable(true)}>
                    <source src={background} type="video/webm" />
                </video>
            )}
            <div className={styles['donate-info']}>
                <h2 className={styles['donate-title']}>{t('DONATE.TITLE')}</h2>
                <div className={styles['donate-button']}>
                    <h4>{t('DONATE.DESCRIPTION')}</h4>
                    <Button
                        href={PUBLIC_ROUTES.DONATE.FULL}
                        variant="primary-light"
                        aria-label={t('DONATE.SUBMIT_BUTTON')}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('DONATE.SUBMIT_BUTTON')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
