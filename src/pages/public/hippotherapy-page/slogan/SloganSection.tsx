import { useTranslation } from 'react-i18next';
import styles from './SloganSection.module.scss';

export const SloganSection = () => {
    const { t } = useTranslation('hippotherapy');

    return (
        <section>
            <h1 className={styles.slogan} data-testid="slogan-section">
                <span className={styles.highlight + ' ' + styles.yellow}>{t('SLOGAN.FIRST_HIGHLIGHT')}</span>
                {t('SLOGAN.FIRST_TEXT')}
                <br />
                <span>{t('SLOGAN.SECOND_TEXT')} </span>
                <span className={styles.highlight + ' ' + styles.blue}>{t('SLOGAN.SECOND_HIGHLIGHT')} </span>
                {/* add a space between span text */}
                <span> </span>
                <span className={styles.highlight + ' ' + styles.blue}>{t('SLOGAN.THIRD_HIGHLIGHT')}</span>
            </h1>
        </section>
    );
};
