import React from 'react';
import {
    PARTNER_SECOND_SECTION,
    PARTNERS_SECOND_SECTION_DESCRIPTION,
    PARTNERS_SECOND_SECTION_TITLE,
} from '../../../../const/partners-page/partners-page';
import { PartnerSection } from '../../../../components/partners/PartnerSection';

export const PartnersSecondSectionContent: React.FC = () => {
    return (
        <PartnerSection
            title={PARTNERS_SECOND_SECTION_TITLE}
            description={PARTNERS_SECOND_SECTION_DESCRIPTION}
            partners={PARTNER_SECOND_SECTION}
        />
    );
};
