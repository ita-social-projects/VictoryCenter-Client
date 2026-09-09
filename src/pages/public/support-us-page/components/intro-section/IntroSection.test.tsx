import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { IntroSection } from './IntroSection';

describe('IntroSection', () => {
    test('should render a level 1 heading', () => {
        render(<IntroSection />);
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('should render three title spans with the highlight classes on the first and last', () => {
        const { container } = render(<IntroSection />);
        const spans = container.querySelectorAll('h1 span');
        expect(spans.length).toEqual(3);
        expect(spans[0]).toHaveClass('highlight-yellow');
        expect(spans[2]).toHaveClass('highlight-blue');
    });

    test('should render a non-empty description paragraph', () => {
        const { container } = render(<IntroSection />);
        const paragraph = container.querySelector('.additional-info p');
        expect(paragraph).toBeInTheDocument();
        expect(paragraph?.textContent?.trim().length).toBeGreaterThan(0);
    });

    test('should have correct class names', () => {
        const { container } = render(<IntroSection />);
        expect(container.querySelector('.intro-section')).toBeInTheDocument();
        expect(container.querySelector('.additional-info')).toBeInTheDocument();
    });
});
