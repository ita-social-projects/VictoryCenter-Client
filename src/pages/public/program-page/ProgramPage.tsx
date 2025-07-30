import React from 'react';
import { IntroSection } from './intro-section/IntroSection';
import { ProgramSection } from './program-section/ProgramSection';
import { ContactSection } from './contact-section/ContactSection';
import { FaqSection } from '../../../components/public/faq-section/FaqSection';

export const ProgramPage = () => {
    return (
        <>
            <IntroSection />
            <ProgramSection />
            <FaqSection slug="program-page" />
            <ContactSection />
        </>
    );
};
