import { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import { useDataFetch } from '../../../hooks/common/use-data-fetch/useDataFetch';
import { donatePageDataFetch } from '../../../services/api/public/donate/donate-api';
import { DonatePageData } from '../../../types/public/donate-page';
import { PAGE_SLUGS } from '../../../const/public/faq';
import { FaqSection } from '../../../components/public/faq-section/FaqSection';
import { DonatePageIntro } from './donate-page-intro/DonatePageIntro';
import { DonateSection } from './donate-section/DonateSection';
import { RightSection } from './right-section/RightSection';
import styles from './DonatePage.module.scss';

export const DonatePage = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const { data: donateData, error } = useDataFetch<DonatePageData | null>({
        initialData: null,
        fetchHandler: donatePageDataFetch,
        autoFetchDependencies: [],
    });

    useEffect(() => {
        if (donateData !== null || error) {
            setIsDataLoaded(true);
        }
    }, [donateData, error]);

    const renderLoader = () => (
        <div className={styles['donatePage']}>
            <DonatePageIntro />
            <div className={styles['donate-page-loader']}>
                <LinearProgress />
            </div>
        </div>
    );

    const renderContent = () => (
        <div className={styles['donatePage']}>
            <DonatePageIntro />
            <div className={styles['donatePageContent']}>
                <div className={styles['stickyBlock']}>
                    <DonateSection />
                </div>
                <div className={styles['rightSectionContainer']}>
                    <RightSection donateData={donateData} error={error} />
                </div>
            </div>
            <FaqSection slug={PAGE_SLUGS.DONATE} />
        </div>
    );

    return !isDataLoaded ? renderLoader() : renderContent();
};
