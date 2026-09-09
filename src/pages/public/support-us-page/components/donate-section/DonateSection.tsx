import { useTranslation } from 'react-i18next';
import { CtaSection } from '@/components/public/cta';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import background from '@/assets/videos/child-riding-horse.webm';

export const DonateSection = () => {
    const { t } = useTranslation('supportUsPage');

    return (
        <CtaSection
            title={t('DONATE.TITLE')}
            description={t('DONATE.DESCRIPTION')}
            mediaUrl={background}
            buttons={[{ label: t('DONATE.SUBMIT_BUTTON'), href: PUBLIC_ROUTES.DONATE.FULL }]}
        />
    );
};
