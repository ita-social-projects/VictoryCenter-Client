import { AboutUsIntro } from './intro-section/IntroSection';
import { OurMission } from './our-mission/OurMission';
import { SupportSection } from './support-section/SupportSection';
import { CompanyValues } from './company-values/CompanyValues';
import { OurTeam } from './our-team-section/OurTeam';
import { MainValues } from './main-value/MainValue';
import { DonateSection } from './donate-section/DonateSection';
import { ProgramsSection } from './programs-section/ProgramsSection';
import { AboutUsApi } from '@/services/api/public/about-us/about-us-api';
import { AboutUsSection, AboutUsContent } from '@/types/public/about-us-page';
import { SectionType } from '@/types/common/about-us';
import { LinearProgress } from '@mui/material';
import styles from './AboutUsPage.module.scss';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useTranslation } from 'react-i18next';
import { ProgramsPageData } from '@/types/public/programs-page';
import { programPageDataFetch } from '@/services/api/public/programs/programs-api';

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
        isLoading: sectionsLoading,
        error: sectionsError,
    } = useDataFetch<AboutUsSection[] | null>({
        initialData: null,
        fetchHandler: AboutUsApi.get,
        autoFetchDependencies: [t],
    });

    const {
        data: programsData,
        isLoading: programsLoading,
        error: programsError,
    } = useDataFetch<ProgramsPageData | null>({
        initialData: null,
        fetchHandler: programPageDataFetch,
    });

    if (sectionsLoading || programsLoading) {
        return (
            <div className={styles.loader}>
                <LinearProgress />
            </div>
        );
    }

    if (sectionsError || programsError) {
        return (
            <div className={styles.error} role="alert">
                {t('DOWNLOAD_ERROR')}
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <AboutUsIntro content={getContentBySection(sections, SectionType.Main)} />
            <OurMission content={getContentBySection(sections, SectionType.WhatWeDo)} />
            <ProgramsSection content={programsData} />
            <SupportSection content={getContentBySection(sections, SectionType.WhoWeSupport)} />
            <CompanyValues />
            <OurTeam content={getContentBySection(sections, SectionType.Team)} />
            <MainValues content={getContentBySection(sections, SectionType.People)} />
            <DonateSection />
        </div>
    );
};
