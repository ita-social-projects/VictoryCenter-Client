import { IntroSection } from './intro-section/IntroSection';
import { ProgramsSection } from './programs-section/ProgramsSection';
import { ContactSection } from './contact-section/ContactSection';
import { QuestionSection } from './question-section/QuestionSection';
import { FaqSection } from '../../../components/public/faq-section/FaqSection';

export const ProgramsPage = () => {
    return (
        <>
            <IntroSection />
            <ProgramsSection />
            <QuestionSection />
            <FaqSection slug="program-page" />
            <ContactSection />
        </>
    );
};
