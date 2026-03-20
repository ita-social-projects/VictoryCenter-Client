import background from '@/assets/images/horses.webp';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useTranslation } from 'react-i18next';
import styles from './DonateSection.module.scss';
import { CtaSection } from '@/components/public/cta';

export const DonateSection = () => {
    const { t } = useTranslation('aboutUsPage');

    return (
        <div className={styles.root}>
            <CtaSection
                title={t('DONATE_TITLE')}
                description={t('DONATE_DETAILS')}
                mediaUrl={background}
                buttons={[
                    { label: t('DONATE'), href: PUBLIC_ROUTES.DONATE.FULL },
                    { label: t('BECOME_PARTNER'), href: PUBLIC_ROUTES.DONATE.FULL },
                ]}
            />
        </div>
    );
};
