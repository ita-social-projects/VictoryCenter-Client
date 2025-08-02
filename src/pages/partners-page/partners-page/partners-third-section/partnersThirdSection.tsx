import React from 'react';
import {
    PARTNERS_THIRD_SECTION_TITLE,
    PARTNERS_THIRD_SECTION_DESCRIPTION,
    PARTNER_THIRD_SECTION,
} from '../../../../const/partners-page/partners-page';
import './partners-third-section.scss';

export const PartnersThirdSection: React.FC = () => {
    return (
        <section className="partners-content-section">
            <div className="container">
                <div className="partners-header">
                    <h2 className="section-title">
                        {PARTNERS_THIRD_SECTION_TITLE.FIRST_LINE}
                        {PARTNERS_THIRD_SECTION_TITLE.SECOND_LINE}
                    </h2>
                    <p className="section-description">
                        {PARTNERS_THIRD_SECTION_DESCRIPTION.FIRST_LINE}
                        {PARTNERS_THIRD_SECTION_DESCRIPTION.SECOND_LINE}
                    </p>
                </div>
                <div className="partners-logos">
                    {PARTNER_THIRD_SECTION.map((partner) => (
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
