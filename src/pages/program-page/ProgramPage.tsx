import React from "react";
import { IntroSection } from "./program-page/intro-section/IntroSection";
import { ProgramSection } from "./program-page/program-section/ProgramSection";
import { ContactSection } from "./program-page/contact-section/ContactSection";
import { QuestionSection } from "./program-page/question-section/QuestionSection";

export const ProgramPage = () => {
    return (
        <>
            <IntroSection />
            <ProgramSection />
            <QuestionSection />
            <ContactSection />
        </>
    );
};
