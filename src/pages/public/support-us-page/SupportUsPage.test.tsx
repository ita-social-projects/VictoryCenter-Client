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

jest.mock('./components/intro-section/IntroSection', () => ({
    IntroSection: () => <section data-testid="intro-section" />,
}));

jest.mock('./components/partners-section/PartnersSection', () => ({
    PartnersSection: () => <section data-testid="partners-section" />,
}));

jest.mock('./components/contact-section/ContactSection', () => ({
    ContactSection: () => <section data-testid="contact-section" />,
}));

jest.mock('./components/donate-section/DonateSection', () => ({
    DonateSection: () => <section data-testid="donate-section" />,
}));

describe('SupportUsPage', () => {
    it('renders the intro section', () => {
        render(<SupportUsPage />);

        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    });

    it('renders the contact section', () => {
        render(<SupportUsPage />);

        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('renders the partners section', () => {
        render(<SupportUsPage />);

        expect(screen.getByTestId('partners-section')).toBeInTheDocument();
    });

    it('renders the sections in order: intro, partners, contact', () => {
        render(<SupportUsPage />);

        const intro = screen.getByTestId('intro-section');
        const partners = screen.getByTestId('partners-section');
        const contact = screen.getByTestId('contact-section');
        expect(intro.compareDocumentPosition(partners) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(partners.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('renders the page as a main landmark', () => {
        render(<SupportUsPage />);

        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders the contact section inside the main landmark', () => {
        render(<SupportUsPage />);

        const main = screen.getByRole('main');
        expect(main).toContainElement(screen.getByTestId('contact-section'));
    });

    it('renders the donate section inside the main landmark', () => {
        render(<SupportUsPage />);

        const main = screen.getByRole('main');
        expect(main).toContainElement(screen.getByTestId('donate-section'));
    });
});
