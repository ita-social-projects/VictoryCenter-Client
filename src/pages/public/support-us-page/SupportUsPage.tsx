import React from 'react';
import styles from './SupportUsPage.module.scss';
import { IntroSection } from './components/intro-section/IntroSection';
import { PartnersSection } from './components/partners-section/PartnersSection';
import { ContactSection } from './components/contact-section/ContactSection';

export const SupportUsPage: React.FC = () => {
    return (
        <main className={styles.page}>
            <IntroSection />
            <PartnersSection />
            <ContactSection />
        </main>
    );
};
