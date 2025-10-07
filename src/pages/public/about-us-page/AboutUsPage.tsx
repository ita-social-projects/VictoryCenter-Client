import { useEffect, useState } from 'react';
import { AboutUsIntro } from './intro-section/IntroSection';
import { OurMission } from './our-mission/OurMission';
import { SupportSection } from './support-section/SupportSection';
import { CompanyValues } from './company-values/CompanyValues';
import { OurTeam } from './our-team-section/OurTeam';
import { MainValues } from './main-value/MainValue';
import { DonateSection } from './donate-section/DonateSection';
import { ScrollableFrame } from './scrollable-frame/ScrollableFrame';
import { AboutUsApi } from '../../../services/api/public/about-us/about-us-api';
import { axiosInstance } from '../../../services/api/axios';
import { AboutUsSection, AboutUsContent } from '../../../types/public/about-us-page';
import { SectionType } from '../../../types/common/about-us';
import { LinearProgress } from '@mui/material';
import { ABOUT_US_DATA } from '../../../const/public/about-us-page';
import './AboutUsPage.scss';

export const AboutUsPage = () => {
    const [sections, setSections] = useState<AboutUsSection[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchAboutUsSections = async () => {
            setLoading(true);
            try {
                const sections = await AboutUsApi.get(axiosInstance);
                setSections(sections);
                setError(null);
            } catch (error) {
                setSections([]);
                setError(ABOUT_US_DATA.DOWNLOAD_ERROR);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutUsSections();
    }, []);

    return (
        <>
            {loading ? (
                <div className="about-us-loader">
                    <LinearProgress />
                </div>
            ) : (
                <>
                    {error ? (
                        <div className="about-us-error-message" role="alert">
                            {error}
                        </div>
                    ) : (
                        <>
                            <AboutUsIntro content={getContentBySection(sections, SectionType.Main)} />
                            <OurMission content={getContentBySection(sections, SectionType.WhatWeDo)} />
                            <ScrollableFrame />
                            <SupportSection content={getContentBySection(sections, SectionType.WhoWeSupport)} />
                            <CompanyValues />
                            <OurTeam content={getContentBySection(sections, SectionType.Team)} />
                            <MainValues content={getContentBySection(sections, SectionType.People)} />
                            <DonateSection />
                        </>
                    )}
                </>
            )}
        </>
    );
};

const getContentBySection = (sections: AboutUsSection[] | null, sectionType: SectionType): AboutUsContent[] | null => {
    if (!sections) return null;

    const section = sections.find((x) => x.sectionType === sectionType);
    if (!section || !section.contents || !section.contents.length) return null;

    return section.contents;
};
