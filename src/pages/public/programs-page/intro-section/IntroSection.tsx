import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './IntroSection.module.scss';

export const IntroSection: React.FC = () => {
    const { t } = useTranslation('programsPage');

    return (
        <div className={styles['intro-section']}>
            <h1>
                <span>{t('MAIN_TITLE.PREFIX')}</span>
                <span className={styles['highlight-yellow']}>{t('MAIN_TITLE.FIRST_HIGHLIGHT')}</span>
                <span>{t('MAIN_TITLE.MIDDLE')}</span>
                <span className={styles['highlight-blue']}>{t('MAIN_TITLE.SECOND_HIGHLIGHT')}</span>
            </h1>
            <div className={styles['additional-info']}>
                <p>
                    {t('VICTORY_CENTER_BELIEF.FIRST_LINE')}
                    <br />
                    {t('VICTORY_CENTER_BELIEF.SECOND_LINE')}
                </p>
                <p>{t('ABOUT_PROGRAMS')}</p>
            </div>
        </div>
    );
};
