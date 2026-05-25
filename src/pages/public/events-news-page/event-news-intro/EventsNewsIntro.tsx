import { useTranslation } from 'react-i18next';
import styles from './EventsNewsIntro.module.scss';

interface EventsNewsIntroProps {
    description: string;
}

export const EventsNewsIntro = ({ description }: EventsNewsIntroProps) => {
    const { t } = useTranslation('eventsNewsPage');

    return (
        <section>
            <div className={styles['events-news-intro']}>
                <h1 className={styles.slogan}>
                    <span className={styles.yellow}>{t('SLOGAN.MOMENTS')} </span>
                    <br />
                    <span className={styles['break-text']}>{t('SLOGAN.AND')} </span>
                    <span className={styles.highlight + ' ' + styles.blue}> {t('SLOGAN.CHANGES')}</span>
                </h1>
                <p className={styles.description}>{description}</p>
            </div>
        </section>
    );
};
