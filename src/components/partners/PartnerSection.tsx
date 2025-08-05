import React from 'react';
import './partner-section.scss';

interface Partner {
    id: number;
    name: string;
    logo: string;
}

interface PartnerSectionProps {
    title: {
        FIRST_LINE: string;
        SECOND_LINE: string;
    };
    description: {
        FIRST_LINE: string;
        SECOND_LINE: string;
    };
    partners: Partner[];
}

export const PartnerSection: React.FC<PartnerSectionProps> = ({ title, description, partners }) => {
    return (
        <section className="partners-content-section">
            <div className="container">
                <div className="partners-header">
                    <h2 className="section-title">
                        {title.FIRST_LINE}
                        {title.SECOND_LINE}
                    </h2>
                    <p className="section-description">
                        {description.FIRST_LINE}
                        {description.SECOND_LINE}
                    </p>
                </div>
                <div className="partners-logos">
                    {partners.map((partner) => (
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
