import { DonatePageIntro } from './donate-page-intro/DonatePageIntro';
import { DonateSection } from './donate-section/DonateSection';
import './DonatePage.scss';
import { RightSection } from './right-section/RightSection';
import { PAGE_SLUGS } from '../../../const/public/faq';
import { FaqSection } from '../../../components/public/faq-section/FaqSection';
import { useDataFetch } from '../../../hooks/common/use-data-fetch/useDataFetch';
import { donatePageDataFetch } from '../../../services/api/public/donate/donate-api';
import { DonatePageData } from '../../../types/public/donate-page';
import { LinearProgress } from '@mui/material';

export const DonatePage = () => {
    const {
        data: donateData,
        isLoading,
        error,
    } = useDataFetch<DonatePageData | null>({
        initialData: null,
        fetchHandler: donatePageDataFetch,
        autoFetchDependencies: [],
    });

    if (isLoading) {
        return (
            <div className="donate-page-loader">
                <LinearProgress />
            </div>
        );
    }

    return (
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
};
