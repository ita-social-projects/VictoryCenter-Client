import React from 'react';
import { IntroSection } from './program-page/intro-section/IntroSection';
import { ProgramSection } from './program-page/program-section/ProgramSection';
import { ContactSection } from './program-page/contact-section/ContactSection';
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
