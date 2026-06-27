import { useTranslation } from 'react-i18next';
import { CtaSection } from '@/components/public/cta';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import quoteBg from './quote-bg.png';

export const HistoryQuote = () => {
    const { t } = useTranslation('historyPage');

    return (
        <CtaSection
            title={t('CLOSING_TITLE')}
            description={t('CLOSING_DESCRIPTION')}
            mediaUrl={quoteBg}
            overlay={{ opacity: 0.35, color: '#0f0600' }}
            buttons={[
                { label: t('CLOSING_BTN_DONATE'), href: PUBLIC_ROUTES.DONATE.FULL },
                { label: t('CLOSING_BTN_PARTNER'), href: PUBLIC_ROUTES.PARTNERS.FULL },
            ]}
        />
    );
};
