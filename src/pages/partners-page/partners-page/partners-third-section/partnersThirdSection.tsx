import React from 'react';
import {
    PARTNERS_THIRD_SECTION_TITLE,
    PARTNERS_THIRD_SECTION_DESCRIPTION,
    PARTNER_THIRD_SECTION,
} from '../../../../const/partners-page/partners-page';
import { PartnerSection } from '../../../../components/partners/PartnerSection';

export const PartnersThirdSection: React.FC = () => {
    return (
        <PartnerSection
            title={PARTNERS_THIRD_SECTION_TITLE}
            description={PARTNERS_THIRD_SECTION_DESCRIPTION}
            partners={PARTNER_THIRD_SECTION}
        />
    );
};
