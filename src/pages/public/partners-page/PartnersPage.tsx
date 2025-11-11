import { useState, useEffect } from 'react';
import { IntroSection } from './partners-sections/intro-section/IntroSection';
import { OutroSection } from './partners-sections/outro-section/OutroSection';
import { PartnersSection } from './partners-sections/partners-section/PartnersSection';
import { PartnerPage } from '../../../types/public/partners-page';
import { PartnersApi } from '../../../services/api/public/partners/partners-api';
import { axiosInstance } from '../../../services/api/axios';
import { DOWNLOAD_ERROR } from '../../../const/public/partners-page';
import { LinearProgress } from '@mui/material';
import './PartnersPage.scss';

export const PartnersPage = () => {
    const [partnersPageData, setPartnersPageData] = useState<PartnerPage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        const fetchPartnersPageData = async () => {
            try {
                setIsLoading(true);
                const page = await PartnersApi.getPage(axiosInstance);
                setPartnersPageData(page);
                setError(null);
            } catch (error) {
                setError(DOWNLOAD_ERROR);
                setPartnersPageData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPartnersPageData();
    }, []);

    if (isLoading) {
        return (
            <div className="partners-page-loader">
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return <div className="partners-page-error-message">{error}</div>;
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
