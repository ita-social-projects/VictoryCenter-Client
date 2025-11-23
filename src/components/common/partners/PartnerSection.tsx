import React from 'react';
import styles from './PartnerSection.module.scss';

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

export const PartnerSection = ({ title, description, partners }: PartnerSectionProps) => {
    return (
        <section className={styles['partners-content-section']}>
            <div className={styles['container']}>
                <div className={styles['partners-header']}>
                    <h2 className="section-title">
                        {title.FIRST_LINE}
                        {title.SECOND_LINE}
                    </h2>
                    <p className={styles['section-description']}>
                        {description.FIRST_LINE}
                        {description.SECOND_LINE}
                    </p>
                </div>
                <div className={styles['partners-logos']}>
                    {partners.map((partner) => (
                        <div key={partner.id} className={styles['partner-item']}>
                            <img src={partner.logo} alt={`${partner.name} logo`} className={styles['partner-logo']} />
                            <p className={styles['partner-name']}>{partner.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
