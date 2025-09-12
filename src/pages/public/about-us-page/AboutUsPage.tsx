import { AboutUsIntro } from './intro-section/IntroSection';
import { OurMission } from './our-mission/OurMission';
import { SupportSection } from './support-section/SupportSection';
import { CompanyValues } from './company-values/CompanyValues';
import { OurTeam } from './our-team-section/OurTeam';
import { MainValues } from './main-value/MainValue';
import { DonateSection } from './donate-section/DonateSection';
import { ScrollableFrame } from './scrollable-frame/ScrollableFrame';
import { ABOUT_US_DATA } from '../../../const/public/about-us-page';

export const AboutUsPage = () => {
    return (
        <>
            <AboutUsIntro />
            <OurMission details={ABOUT_US_DATA.WHAT_WE_DO_DETAILS} />
            <ScrollableFrame />
            <SupportSection />
            <CompanyValues />
            <OurTeam />
            <MainValues />
            <DonateSection />
        </>
    );
};
