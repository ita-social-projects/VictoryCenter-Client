import {AboutUsIntro} from "./intro-section/IntroSection";
import {OurMission} from "./our-mission/OurMission";
import {SupportSection} from "./support-section/SupportSection";
import {CompanyValues} from "./company-values/CompanyValues";
import {OurTeam} from "./our-team-section/OurTeam";

export const AboutUsPage = () => {
    return (<>
        <AboutUsIntro/>
        <OurMission/>
        <SupportSection/>
        <CompanyValues/>
        <OurTeam/>
    </>)
}