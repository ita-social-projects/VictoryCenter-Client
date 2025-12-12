import { IntroSection } from './partners-sections/intro-section/IntroSection';
import { OutroSection } from './partners-sections/outro-section/OutroSection';
import { PartnersSection } from './partners-sections/partners-section/PartnersSection';
import { PartnerPage } from '@/types/public/partners-page';
import { PartnersApi } from '@/services/api/public/partners/partners-api';
import { DOWNLOAD_ERROR } from '@/const/public/partners-page';
import { LinearProgress } from '@mui/material';
import styles from './PartnersPage.module.scss';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';

export const PartnersPage = () => {
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
            {partnersPageData?.sections.map((section) => (
                <PartnersSection key={section.id} section={section} />
            ))}
            <OutroSection />
        </>
    );
};
