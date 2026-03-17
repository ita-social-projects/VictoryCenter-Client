import { useTranslation } from 'react-i18next';
import styles from './SloganSection.module.scss';

export const SloganSection = () => {
    const { t } = useTranslation('hippotherapy');
    const yellowHighlightClass = `${styles.highlight} ${styles.yellow}`;
    const blueHighlightClass = `${styles.highlight} ${styles.blue} ${styles['break-text']}`;
    const spacedClass = `${styles['break-text']} ${styles.spaced}`;

    return (
        <section>
            <h1 className={styles.slogan} data-testid="slogan-section">
                <span className={yellowHighlightClass}>{t('SLOGAN.FIRST_HIGHLIGHT')}</span>
                {/* keep space for correct text breaking */}
                <span className={spacedClass}> {t('SLOGAN.FIRST_TEXT')}</span>
                <br />
                <span className={spacedClass}> {t('SLOGAN.SECOND_TEXT')} </span>
                <span className={blueHighlightClass}>{t('SLOGAN.SECOND_HIGHLIGHT')} </span>
                <span className={blueHighlightClass}>{t('SLOGAN.THIRD_HIGHLIGHT')}</span>
            </h1>
        </section>
    );
};
