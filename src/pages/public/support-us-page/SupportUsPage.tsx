import React from 'react';
import { HeroSection } from './components/hero-section/HeroSection';
import { PartnerTypesSection } from './components/partner-types-section/PartnerTypesSection';
import { ContactSection } from './components/contact-section/ContactSection';
import { CtaSection } from './components/cta-section/CtaSection';
import styles from './SupportUsPage.module.scss';

export const SupportUsPage: React.FC = () => {
    return (
        <main className={styles.page}>
            <HeroSection />
            <PartnerTypesSection />
            <ContactSection />
            <CtaSection />
        </main>
    );
};
