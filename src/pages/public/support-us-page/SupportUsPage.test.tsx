import { render, screen } from '@testing-library/react';
import { SupportUsPage } from './SupportUsPage';

jest.mock(
    './SupportUsPage.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

jest.mock('./components/contact-section/ContactSection', () => ({
    ContactSection: () => <section data-testid="contact-section" />,
}));

describe('SupportUsPage', () => {
    it('renders the contact section', () => {
        render(<SupportUsPage />);

        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('renders the page as a main landmark with the page class', () => {
        render(<SupportUsPage />);

        expect(screen.getByRole('main')).toHaveClass('page');
    });

    it('renders the contact section inside the main landmark', () => {
        render(<SupportUsPage />);

        const main = screen.getByRole('main');
        expect(main).toContainElement(screen.getByTestId('contact-section'));
    });
});
