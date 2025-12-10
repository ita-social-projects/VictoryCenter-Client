import React from 'react';
import { IntroSection } from './partners-sections/intro-section/IntroSection';
import { OutroSection } from './partners-sections/outro-section/OutroSection';
import { PartnerSection } from '@/components/common/partners/PartnerSection';
import {
    PARTNER_FIRST_SECTION,
    PARTNER_FOURTH_SECTION,
    PARTNER_SECOND_SECTION,
    PARTNER_THIRD_SECTION,
    PARTNERS_FIRST_SECTION_DESCRIPTION,
    PARTNERS_FIRST_SECTION_TITLE,
    PARTNERS_FOURTH_SECTION_DESCRIPTION,
    PARTNERS_FOURTH_SECTION_TITLE,
    PARTNERS_SECOND_SECTION_DESCRIPTION,
    PARTNERS_SECOND_SECTION_TITLE,
    PARTNERS_THIRD_SECTION_DESCRIPTION,
    PARTNERS_THIRD_SECTION_TITLE,
} from '@/const/public/partners-page';

export const PartnersPage = () => {
    return (
        <>
            <IntroSection />
            <PartnerSection
                title={PARTNERS_FIRST_SECTION_TITLE}
                description={PARTNERS_FIRST_SECTION_DESCRIPTION}
                partners={PARTNER_FIRST_SECTION}
            />
            <PartnerSection
                title={PARTNERS_SECOND_SECTION_TITLE}
                description={PARTNERS_SECOND_SECTION_DESCRIPTION}
                partners={PARTNER_SECOND_SECTION}
            />
            <PartnerSection
                title={PARTNERS_THIRD_SECTION_TITLE}
                description={PARTNERS_THIRD_SECTION_DESCRIPTION}
                partners={PARTNER_THIRD_SECTION}
            />
            <PartnerSection
                title={PARTNERS_FOURTH_SECTION_TITLE}
                description={PARTNERS_FOURTH_SECTION_DESCRIPTION}
                partners={PARTNER_FOURTH_SECTION}
            />
            <OutroSection />
        </>
    );
};
