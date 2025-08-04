import { render, screen } from '@testing-library/react';
import { ProgramsPage } from './ProgramsPage';

jest.mock('./intro-section/IntroSection', () => ({
    IntroSection: () => <div data-testid="intro-section">IntroSection</div>,
}));

jest.mock('./programs-section/ProgramsSection', () => ({
    ProgramsSection: () => <div data-testid="programs-section">ProgramsSection</div>,
}));

jest.mock('./question-section/QuestionSection', () => ({
    QuestionSection: () => <div data-testid="question-section">QuestionSection</div>,
}));

jest.mock('./contact-section/ContactSection', () => ({
    ContactSection: () => <div data-testid="contact-section">ContactSection</div>,
}));

describe('ProgramsPage', () => {
    test('should render all sections', () => {
        render(<ProgramsPage />);

        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(screen.getByTestId('programs-section')).toBeInTheDocument();
        expect(screen.getByTestId('question-section')).toBeInTheDocument();
        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });
});
