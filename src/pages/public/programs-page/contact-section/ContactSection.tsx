import React from 'react';
import background from '@/assets/videos/public/programs-page/contact_us_background.mp4';
import { useTranslation } from 'react-i18next';
import { CtaSection } from '@/components/public/cta';

export const ContactSection: React.FC = () => {
    const { t } = useTranslation('programsPage');

    return (
        <CtaSection
            title={t('PROGRAM_PROMPT')}
            description={t('TEXT_US')}
            mediaUrl={background}
            buttons={[{ label: t('CONTACT') }]}
        />
    );
};
