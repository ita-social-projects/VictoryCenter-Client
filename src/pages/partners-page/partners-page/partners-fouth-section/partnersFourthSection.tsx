import React from 'react';
import {
    PARTNERS_FOURTH_SECTION_TITLE,
    PARTNERS_FOURTH_SECTION_DESCRIPTION,
    PARTNER_FOURTH_SECTION,
} from '../../../../const/partners-page/partners-page';
import { PartnerSection } from '../../../../components/partners/PartnerSection';

export const PartnersFourthSectionContent: React.FC = () => {
    return (
        <PartnerSection
            title={PARTNERS_FOURTH_SECTION_TITLE}
            description={PARTNERS_FOURTH_SECTION_DESCRIPTION}
            partners={PARTNER_FOURTH_SECTION}
        />
    );
};
