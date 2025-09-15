import { AboutUsIntro } from './intro-section/AboutUsIntro';
import { OurMission } from './our-mission/OurMission';
import { SupportSection } from './support-section/SupportSection';
import { CompanyValues } from './company-values/CompanyValues';
import { OurTeam } from './our-team-section/OurTeam';
import { MainValues } from './main-value/MainValue';
import { DonateSection } from './donate-section/DonateSection';
import { ScrollableFrame } from './scrollable-frame/ScrollableFrame';

export const AboutUsPage = () => {
    return (
        <>
            <AboutUsIntro />
            <OurMission />
            <ScrollableFrame />
            <SupportSection />
            <CompanyValues />
            <OurTeam />
            <MainValues />
            <DonateSection />
        </>
    );
};
