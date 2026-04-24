import React from 'react';
import { PartnerSection } from '@/types/public/partners-page';
import styles from './PartnersSection.module.scss';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';

interface PartnersSectionProps {
    section: PartnerSection | null;
}

export const PartnersSection = ({ section }: PartnersSectionProps) => {
    if (!section) {
        return null;
    }

    return (
        <section className={styles['partners-content-section']}>
            <div className={styles.container}>
                <div className={styles['partners-header']}>
                    <h2 className={styles['section-title']}>{section.title}</h2>
                    <p className={styles['section-description']}>{section.description}</p>
                </div>
                <div className={styles['partners-logos']}>
                    {section.partners.map((partner) => (
                        <div key={partner.id} className={styles['partner-item']}>
                            <img
                                src={getImageSrc(partner.image)}
                                alt={`${partner.id} logo`}
                                className={styles['partner-logo']}
                            />
                            <p className={styles['partner-name']}>{partner.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
