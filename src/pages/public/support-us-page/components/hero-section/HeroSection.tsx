import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './HeroSection.module.scss';

export const HeroSection: React.FC = () => {
    const { t } = useTranslation('support-us');

    return (
        <section className={styles.hero}>
            <div className={styles.content}>
                <h1 className={styles.title}>{t('heroTitle')}</h1>
                <p className={styles.description}>{t('heroDescription')}</p>
            </div>
        </section>
    );
};
