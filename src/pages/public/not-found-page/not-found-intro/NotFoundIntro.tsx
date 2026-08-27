import styles from './NotFoundIntro.module.scss';
import { useTranslation } from 'react-i18next';

export const NotFoundIntro = () => {
    const { t } = useTranslation('notFoundPage');

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <h1 className={styles.text}>{t('ERROR_404')}</h1>
            </div>
        </div>
    );
};
