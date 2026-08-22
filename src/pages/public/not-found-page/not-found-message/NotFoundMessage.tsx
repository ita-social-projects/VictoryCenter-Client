import styles from './NotFoundMessage.module.scss';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { Button } from '@/components/public/ui/button';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { localizePath } from '@/utils/functions/localize-path/localize-path';
import { useTranslation } from 'react-i18next';

export const NotFoundMessage = () => {
    const { t } = useTranslation('notFoundPage');
    const { currentLanguage } = useLocale();
    const homeHref = localizePath(PUBLIC_ROUTES.ROOT, currentLanguage);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h4 className={styles.title}>{t('TEXT')}</h4>
            </div>
            <div className={styles.content}>
                <p className={styles.description}>{t('DESCRIPTION')}</p>
                <div className={styles.actions}>
                    <Button href={homeHref} icon={ArrowIcon} iconPosition="right" variant="tertiary">
                        {t('GO_BACK_BUTTON')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
