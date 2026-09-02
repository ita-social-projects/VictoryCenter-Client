import React from 'react';
import styles from './SupportUsPage.module.scss';
import { ContactSection } from './components/contact-section/ContactSection';
import { DonateSection } from './components/donate-section/DonateSection';

export const SupportUsPage: React.FC = () => {
    return (
        <main className={styles.page}>
            <ContactSection />
            <DonateSection />
        </main>
    );
};
