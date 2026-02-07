import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';

jest.mock('react-i18next', () => {
    const programsUk = require('@/locales/uk/programs.json');

    return {
        useTranslation: () => ({
            t: (key: string) => programsUk[key] ?? key,
        }),
    };
});

describe('ContactSection', () => {
    test('should render with CtaSection component', () => {
        render(<ContactSection />);

        const title = screen.getByRole('heading', {
            name: 'Не впевнені, яка програма підійде саме вам?'
        });
        expect(title).toBeInTheDocument();
        expect(title.tagName).toBe('H2');

        const description = screen.getByText(
            'Напишіть нам — ми разом підберемо те, ' +
            'що найкраще відповідає вашим потребам або потребам вашої дитини.'
        );
        expect(description).toBeInTheDocument();

        const button = screen.getByRole('button', { name: "Зв'язатись" });
        expect(button).toBeInTheDocument();
    });

    test('should render background video correctly', () => {
        render(<ContactSection />);
        const videoElement = document.querySelector('video');
        expect(videoElement).toBeInTheDocument();
        expect(videoElement).toHaveAttribute('autoplay');
        expect(videoElement).toHaveAttribute('loop');
        expect(videoElement).toHaveAttribute('playsinline');
    });

    test('should render as section element', () => {
        const { container } = render(<ContactSection />);
        const sectionElement = container.querySelector('section');
        expect(sectionElement).toBeInTheDocument();
        const videoElement = document.querySelector('video');
        expect(videoElement?.closest('section')).toBeInTheDocument();
    });
});
