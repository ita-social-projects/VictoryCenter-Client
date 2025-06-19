import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { IntroSection } from './IntroSection';

describe('IntroSection', () => {
    test('should contain main title', () => {
        render(<IntroSection/>);
        expect(screen.getByRole('heading', {name: 'Ми створюємо простори, де можливе зцілення'}))
            .toBeInTheDocument();
    });
    test('should contain two paragraphs', () => {
        render(<IntroSection/>);
        const firstParagraph = screen.getByText(/зцілення починається не зі слів/i);
        const secondParagraph = screen.getByText(/повернення до себе і віднайдення внутрішньої сили/i);
        expect(firstParagraph).toBeInTheDocument();
        expect(secondParagraph).toBeInTheDocument();
    });
    test('should contain two special spans', () => {
        const {container} = render(<IntroSection/>);
        const spans = container.querySelectorAll('span');
        expect(spans.length).toEqual(2);
        expect(spans[0]).toHaveTextContent('простори,');
        expect(spans[1]).toHaveTextContent('зцілення');
    });
    test('should have correct class names', () => {
        const {container} = render(<IntroSection/>);
        expect(container.querySelector('.intro-section')).toBeInTheDocument();
        expect(container.querySelector('.additional-info')).toBeInTheDocument();
    });
});