import { useTranslation } from 'react-i18next';
import { CtaSection } from '@/components/public/cta';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import quoteBg from './feedback-quote-bg.webp';

export const FeedbackQuote = () => {
    const { t } = useTranslation('feedbackPage');

    return (
        <CtaSection
            title={t('CLOSING_TITLE')}
            description={t('CLOSING_DESCRIPTION')}
            mediaUrl={quoteBg}
            titleVariant="default"
            overlay={{ opacity: 0.35, color: '#0f0600' }}
            buttons={[
                { label: t('CLOSING_BTN_DONATE'), href: PUBLIC_ROUTES.DONATE.FULL },
                { label: t('CLOSING_BTN_PARTNER'), href: PUBLIC_ROUTES.SUPPORT_US.FULL },
            ]}
        />
    );
};
