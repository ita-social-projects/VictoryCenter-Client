import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './IntroSection.module.scss';

export const IntroSection: React.FC = () => {
    const { t } = useTranslation('supportUsPage');

    return (
        <section className={styles['intro-section']}>
            <h1 className={styles.title}>
                <span className={styles['highlight-yellow']}>{t('PAGE_TITLE.FIRST_HIGHLIGHT')}</span>
                <br />
                <span>{t('PAGE_TITLE.SECOND_TEXT')}</span>
                <span className={styles['highlight-blue']}>{t('PAGE_TITLE.SECOND_HIGHLIGHT')}</span>
            </h1>
            <div className={styles['additional-info']}>
                <p>{t('PAGE_DESCRIPTION')}</p>
            </div>
        </section>
    );
};
