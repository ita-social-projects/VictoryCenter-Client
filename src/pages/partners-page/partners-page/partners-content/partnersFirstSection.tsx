import React from 'react';
import { PartnerSection } from '../../../../components/partners/PartnerSection';
import {
    PARTNER_FIRST_SECTION,
    PARTNERS_FIRST_SECTION_DESCRIPTION,
    PARTNERS_FIRST_SECTION_TITLE,
} from '../../../../const/partners-page/partners-page';

export const PartnersFirstSection: React.FC = () => {
    return (
        <PartnerSection
            title={PARTNERS_FIRST_SECTION_TITLE}
            description={PARTNERS_FIRST_SECTION_DESCRIPTION}
            partners={PARTNER_FIRST_SECTION}
        />
    );
};
