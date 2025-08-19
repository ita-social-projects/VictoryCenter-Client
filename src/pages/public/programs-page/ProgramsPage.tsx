import { IntroSection } from './intro-section/IntroSection';
import { ProgramsSection } from './programs-section/ProgramsSection';
import { ContactSection } from './contact-section/ContactSection';
import { QuestionSection } from './question-section/QuestionSection';

export const ProgramsPage = () => {
    return (
        <>
            <IntroSection />
            <ProgramsSection />
            <QuestionSection />
            <ContactSection />
        </>
    );
};
