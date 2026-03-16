import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReportsSection, SummarySection } from './components';
import { CtaSection } from '@/components/public/cta';
import { CTA_DATA } from '@/utils/mock-data/public/reports-page';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import outroVideo from '@/assets/videos/child-riding-horse.webm';

export const ReportsPage = () => {
    const { t } = useTranslation('reportsPage');

    return (
        <>
            <SummarySection />
            <ReportsSection />
            <CtaSection
                title={CTA_DATA.title}
                description={CTA_DATA.description}
                mediaUrl={outroVideo}
                buttons={[{ label: t('cta.buttonLabel'), href: PUBLIC_ROUTES.DONATE.FULL }]}
            />
        </>
    );
};
