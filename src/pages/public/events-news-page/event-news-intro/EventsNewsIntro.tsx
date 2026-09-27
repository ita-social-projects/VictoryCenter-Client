import { useTranslation } from 'react-i18next';
import { SafeHtml } from '@/components/common/safe-html/SafeHtml';
import styles from './EventsNewsIntro.module.scss';

interface EventsNewsIntroProps {
    description: string;
    isHidden?: boolean;
}

export const EventsNewsIntro = ({ description, isHidden }: EventsNewsIntroProps) => {
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
                {!isHidden && <SafeHtml as="p" className={styles.description} html={description} />}
            </div>
        </section>
    );
};
