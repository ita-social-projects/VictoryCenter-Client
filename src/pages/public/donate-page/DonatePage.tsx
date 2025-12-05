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
import './DonatePage.scss';

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
        <div className="donatePage">
            <DonatePageIntro />
            <div className="donate-page-loader">
                <LinearProgress />
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="donatePage">
            <DonatePageIntro />
            <div className="donatePageContent">
                <div className="stickyBlock">
                    <DonateSection />
                </div>
                <div className="rightSectionContainer">
                    <RightSection donateData={donateData} error={error} />
                </div>
            </div>
            <FaqSection slug={PAGE_SLUGS.DONATE} />
        </div>
    );

    return !isDataLoaded ? renderLoader() : renderContent();
};
