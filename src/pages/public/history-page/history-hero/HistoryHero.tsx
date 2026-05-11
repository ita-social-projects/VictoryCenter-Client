import { useTranslation } from 'react-i18next';
import styles from './HistoryHero.module.scss';

export const HistoryHero = () => {
    const { t } = useTranslation('historyPage');

    return (
        <section className={styles['hero-section']}>
            <h1 className={styles.title}>
                {t('TITLE_PLAIN_1')}
                <em className={styles['title-italic']}>{t('TITLE_ITALIC_1')}</em>
                {t('TITLE_PLAIN_2')}
                <em className={styles['title-italic']}>{t('TITLE_ITALIC_2')}</em>
                {t('TITLE_PLAIN_3')}
            </h1>
            <p className={styles.description}>{t('HERO_DESCRIPTION')}</p>
        </section>
    );
};
