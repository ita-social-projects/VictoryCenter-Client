import { useTranslation } from 'react-i18next';
import styles from './SloganSection.module.scss';

export const SloganSection = () => {
    const { t } = useTranslation('successPage');
    const yellowHighlightClass = `${styles.highlight} ${styles.yellow}`;
    const blueHighlightClass = `${styles.highlight} ${styles.blue} ${styles['break-text']}`;
    const blueHighlightLastRowClass = `${styles.highlight} ${styles.blue} ${styles['break-text']} ${styles['blue-last-row']}`;
    const spacedClass = `${styles['break-text']} ${styles.spaced}`;

    return (
        <section>
            <h1 className={styles.slogan} data-testid="slogan-section">
                <span className={yellowHighlightClass}>{t('SLOGAN.FIRST_TEXT')}</span>
                <span className={spacedClass}> {t('SLOGAN.SECOND_TEXT')}</span>
                <br />
                <span className={yellowHighlightClass}>{t('SLOGAN.THIRD_TEXT')} </span>
                <span className={styles['break-below-560']}>
                    <br />
                </span>

                <span className={blueHighlightClass}> {t('SLOGAN.FOURTH_TEXT')} </span>
                <span className={styles['break-above-560']}>
                    <br />
                </span>
                <span className={spacedClass}> {t('SLOGAN.FIFTH_TEXT')} </span>
                <span className={styles['break-below-560']}>
                    <br />
                </span>
                <span className={blueHighlightLastRowClass}>{t('SLOGAN.SIXTH_TEXT')}</span>
            </h1>
        </section>
    );
};
