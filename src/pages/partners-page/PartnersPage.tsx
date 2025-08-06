import React from 'react';
import { IntroSection } from './partners-page/intro-section/introSection';
import { PartnersFirstSection } from './partners-page/partners-content/partnersFirstSection';
import { PartnersSecondSectionContent } from './partners-page/partners-second-section/partnersSecondSection';
import { PartnersThirdSection } from './partners-page/partners-third-section/partnersThirdSection';
import { PartnersFourthSectionContent } from './partners-page/partners-fouth-section/partnersFourthSection';
import { OutroSection } from './partners-page/outro-section/outroSection';

export const PartnersPage: React.FC = () => {
    return (
        <>
            <IntroSection />
            <PartnersFirstSection />
            <PartnersSecondSectionContent />
            <PartnersThirdSection />
            <PartnersFourthSectionContent />
            <OutroSection />
        </>
    );
};
