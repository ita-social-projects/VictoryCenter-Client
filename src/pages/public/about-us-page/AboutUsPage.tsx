import { AboutUsIntro } from './intro-section/IntroSection';
import { OurMission } from './our-mission/OurMission';
import { SupportSection } from './support-section/SupportSection';
import { CompanyValues } from './company-values/CompanyValues';
import { OurTeam } from './our-team-section/OurTeam';
import { MainValues } from './main-value/MainValue';
import { DonateSection } from './donate-section/DonateSection';
import { ScrollableFrame } from './scrollable-frame/ScrollableFrame';
import { AboutUsApi } from '../../../services/api/public/about-us/about-us-api';
import { AboutUsSection, AboutUsContent } from '../../../types/public/about-us-page';
import { SectionType } from '../../../types/common/about-us';
import { LinearProgress } from '@mui/material';
import { ABOUT_US_DATA } from '../../../const/public/about-us-page';
import './AboutUsPage.scss';
import { useDataFetch } from '../../../hooks/common/use-data-fetch/useDataFetch';
import { useTranslation } from 'react-i18next';

const getContentBySection = (sections: AboutUsSection[] | null, sectionType: SectionType): AboutUsContent[] | null => {
    if (!sections) return null;

    const section = sections.find((x) => x.sectionType === sectionType);
    if (!section || !section.contents || !section.contents.length) return null;

    return section.contents;
};

export const AboutUsPage = () => {
    const { t } = useTranslation('aboutUsPage');

    const {
        data: sections,
        isLoading,
        error,
    } = useDataFetch<AboutUsSection[] | null>({
        initialData: null,
        fetchHandler: AboutUsApi.get,
        autoFetchDependencies: [t],
    });

    if (isLoading) {
        return (
            <div className="about-us-loader">
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="about-us-error-message" role="alert">
                {t('DOWNLOAD_ERROR')}
            </div>
        );
    }

    return (
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
    );
};
