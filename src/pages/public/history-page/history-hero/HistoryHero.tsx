import { useTranslation } from 'react-i18next';
import { HistoryTimeline } from '../history-timeline/HistoryTimeline';
import styles from './HistoryHero.module.scss';

export const HistoryHero = () => {
    const { t } = useTranslation('historyPage');

    return (
        <section className={styles['hero-section']}>
            <div className={styles['hero-content']}>
                <h1 className={styles.title}>
                    {t('TITLE_PLAIN_1')}
                    <em className={styles['title-italic']}>{t('TITLE_ITALIC_1')}</em>
                    <br />
                    {t('TITLE_PLAIN_2')}
                    <br />
                    {t('TITLE_PLAIN_3')}
                    <em className={styles['title-italic']}>{t('TITLE_ITALIC_2')}</em>
                    {t('TITLE_PLAIN_4')}
                </h1>
                <p className={styles.description}>{t('HERO_DESCRIPTION')}</p>
            </div>
            <div className={styles['photo-space']} />
            <HistoryTimeline />
        </section>
    );
};
