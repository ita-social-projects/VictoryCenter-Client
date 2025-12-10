import { render, screen } from '@testing-library/react';
import { ProgramsPage } from './ProgramsPage';

jest.mock('./intro-section/IntroSection', () => ({
    IntroSection: () => <div data-testid="intro-section">IntroSection</div>,
}));

jest.mock('./programs-section/ProgramsSection', () => ({
    ProgramsSection: () => <div data-testid="program-section">ProgramSection</div>,
}));

jest.mock('@/components/public/faq-section/FaqSection', () => ({
    FaqSection: () => <div data-testid="faq-section">FaqSection</div>,
}));

jest.mock('./contact-section/ContactSection', () => ({
    ContactSection: () => <div data-testid="contact-section">ContactSection</div>,
}));

describe('ProgramsPage', () => {
    test('should render all sections', () => {
        render(<ProgramsPage />);

        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(screen.getByTestId('program-section')).toBeInTheDocument();
        expect(screen.getByTestId('faq-section')).toBeInTheDocument();
        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });
});
