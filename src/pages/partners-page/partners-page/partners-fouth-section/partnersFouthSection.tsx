import React from 'react';
import {
    PARTNERS_FOURTH_SECTION_TITLE,
    PARTNERS_FOURTH_SECTION_DESCRIPTION,
    PARTNER_FOURTH_SECTION,
} from '../../../../const/partners-page/partners-page';
import './partners-fouth-section.scss';

export const PartnersFouthSectionContent: React.FC = () => {
    return (
        <section className="partners-content-section">
            <div className="container">
                <div className="partners-header">
                    <h2 className="section-title">
                        {PARTNERS_FOURTH_SECTION_TITLE.FIRST_LINE}
                        {PARTNERS_FOURTH_SECTION_TITLE.SECOND_LINE}
                    </h2>
                    <p className="section-description">
                        {PARTNERS_FOURTH_SECTION_DESCRIPTION.FIRST_LINE}
                        {PARTNERS_FOURTH_SECTION_DESCRIPTION.SECOND_LINE}
                    </p>
                </div>
                <div className="partners-logos">
                    {PARTNER_FOURTH_SECTION.map((partner) => (
                        <div key={partner.id} className="partner-item">
                            <img src={partner.logo} alt={`${partner.name} logo`} className="partner-logo" />
                            <p className="partner-name">{partner.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
