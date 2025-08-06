import React from 'react';
import { IntroSection } from './program-page/intro-section/IntroSection';
import { ProgramsSection } from './program-page/program-section/ProgramsSection';
import { ContactSection } from './program-page/contact-section/ContactSection';
import { QuestionSection } from './program-page/question-section/QuestionSection';

export const ProgramPage = () => {
    return (
        <>
            <IntroSection />
            <ProgramsSection />
            <QuestionSection />
            <ContactSection />
        </>
    );
};
