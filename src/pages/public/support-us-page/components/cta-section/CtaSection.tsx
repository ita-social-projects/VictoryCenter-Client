import React from 'react';
import { useTranslation } from 'react-i18next';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import ctaBg from '@/assets/images/people-on-horses.webp';
import styles from './CtaSection.module.scss';

export const CtaSection: React.FC = () => {
    const { t } = useTranslation('support-us');

    const handleDonate = () => {
        window.open(PUBLIC_ROUTES.DONATE.FULL, '_blank', 'noopener,noreferrer');
    };

    return (
        <section className={styles.section} style={{ backgroundImage: `url(${ctaBg})` }}>
            <div className={styles.overlay} />
            <div className={styles.content}>
                <h2 className={styles.title}>{t('ctaTitle')}</h2>
                <p className={styles.description}>{t('ctaDescription')}</p>
                <button type="button" className={styles.donateBtn} onClick={handleDonate}>
                    {t('ctaButton')}
                </button>
            </div>
        </section>
    );
};
