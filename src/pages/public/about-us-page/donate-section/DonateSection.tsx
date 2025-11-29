import background from '../../../../assets/images/public/about-us-page/donate-background.jpg';
import { Link } from 'react-router-dom';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import { useTranslation } from 'react-i18next';
import styles from './DonateSection.module.scss';

export const DonateSection = () => {
    const { t } = useTranslation('aboutUsPage');
    const handlePartner = () => {
        // TODO: implementation of becoming a partner
    };

    return (
        <div className={styles['donate-block']}>
            <img src={background} alt="Background horses" className={styles['donate-background']} />
            <div className={styles['donate-info-block']}>
                <h2 className={styles['donate-title']}>{t('DONATE_TITLE')}</h2>
                <div className={styles['donate-details']}>
                    <h3>{t('DONATE_DETAILS')}</h3>
                    <div className={styles['donate-buttons']}>
                        <Link
                            to={PUBLIC_ROUTES.DONATE.FULL}
                            className={styles['donate-button']}
                            aria-label="Make a donation"
                        >
                            {t('DONATE')}
                        </Link>
                        <button
                            className={styles['partner-button']}
                            onClick={handlePartner}
                            aria-label="Become a partner"
                        >
                            {t('BECOME_PARTNER')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
