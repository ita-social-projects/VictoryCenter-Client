import React from 'react';
import { PartnerSection } from '../../../../../types/public/partners-page';
import './PartnersSection.scss';

interface PartnersSectionProps {
    section: PartnerSection | null;
}

export const PartnersSection = ({ section }: PartnersSectionProps) => {
    if (!section) {
        return null;
    }

    return (
        <section className="partners-content-section">
            <div className="container">
                <div className="partners-header">
                    <h2 className="section-title">{section.title}</h2>
                    <p className="section-description">{section.description}</p>
                </div>
                <div className="partners-logos">
                    {section.partners.map((partner) => (
                        <div key={partner.id} className="partner-item">
                            <img src={partner.image.url} alt={`${partner.id} logo`} className="partner-logo" />
                            <p className="partner-name">{partner.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
