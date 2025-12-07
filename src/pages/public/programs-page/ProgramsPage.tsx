import { IntroSection } from './intro-section/IntroSection';
import { ProgramsSection } from './programs-section/ProgramsSection';
import { ContactSection } from './contact-section/ContactSection';
import { FaqSection } from '@components/public/faq-section/FaqSection';
import { PAGE_SLUGS } from '@const/public/faq';

export const ProgramsPage = () => {
    return (
        <>
            <IntroSection />
            <ProgramsSection />
            <FaqSection slug={PAGE_SLUGS.PROGRAMS} />
            <ContactSection />
        </>
    );
};
