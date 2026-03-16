import { IntroSection } from './partners-sections/intro-section/IntroSection';
import { PartnersSection } from './partners-sections/partners-section/PartnersSection';
import { PartnerPage } from '@/types/public/partners-page';
import { PartnersApi } from '@/services/api/public/partners/partners-api';
import { DOWNLOAD_ERROR } from '@/const/public/partners-page';
import { LinearProgress } from '@mui/material';
import styles from './PartnersPage.module.scss';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import outroVideo from '@/assets/videos/child_riding_horse.webm';
import { CTA_DATA } from '@/utils/mock-data/public/partners-page';
import { CtaSection } from '@/components/public/cta';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useTranslation } from 'react-i18next';

export const PartnersPage: React.FC = () => {
    const { t } = useTranslation('partnersPage');
    const {
        data: partnersPageData,
        isLoading,
        error,
    } = useDataFetch<PartnerPage | null>({
        initialData: null,
        fetchHandler: PartnersApi.getPage,
    });

    if (isLoading) {
        return (
            <div className={styles['partners-page-loader']}>
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return <div className={styles['partners-page-error-message']}>{DOWNLOAD_ERROR}</div>;
    }

    return (
        <>
            <IntroSection banner={partnersPageData?.banner ?? null} />
            <div className={styles['partners-content-sections']}>
                {partnersPageData?.sections.map((section) => (
                    <PartnersSection key={section.id} section={section} />
                ))}
            </div>
            <CtaSection
                title={CTA_DATA.title}
                description={CTA_DATA.description}
                mediaUrl={outroVideo}
                buttons={[
                    { label: t('actions.becomePartner'), href: PUBLIC_ROUTES.DONATE.FULL },
                    { label: t('actions.supportUs'), href: PUBLIC_ROUTES.DONATE.FULL },
                ]}
            />
        </>
    );
};
