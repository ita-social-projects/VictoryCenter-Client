import React from 'react';
import { IntroSection } from './partners-page/intro-section/introSection';
import { PartnersFirstSection } from './partners-page/partners-content/partnersFirstSection';
import { PartnersSecondSectionContent } from './partners-page/partners-second-section/partnersSecondSection';
import { PartnersThirdSection } from './partners-page/partners-third-section/partnersThirdSection';
import { PartnersFouthSectionContent } from './partners-page/partners-fouth-section/partnersFouthSection';
import { OutroSection } from './partners-page/outro-section/outroSection';

import './PartnersPage.scss';

export const PartnersPage: React.FC = () => {
    return (
        <>
            <IntroSection />
            <PartnersFirstSection />
            <PartnersSecondSectionContent />
            <PartnersThirdSection />
            <PartnersFouthSectionContent />
            <OutroSection />
        </>
    );
};
