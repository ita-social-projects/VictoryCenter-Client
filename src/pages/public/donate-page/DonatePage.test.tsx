import { render, screen } from '@testing-library/react';
import { DonatePage } from './DonatePage';

jest.mock('./donate-page-intro/DonatePageIntro', () => ({
    DonatePageIntro: () => (
        <div data-testid="donate-page-intro">
            <h1>
                МИ ВДЯЧНІ
                <br />
                ЗА КОЖЕН ДОНАТ
            </h1>
        </div>
    ),
}));

jest.mock('./donate-section/DonateSection', () => ({
    DonateSection: () => (
        <div data-testid="donate-section">
            <div data-testid="donate-section-form">
                <div>Разовий донат</div>
                <div>Підписка</div>
                <button>Донатити</button>
            </div>
        </div>
    ),
}));

jest.mock('./right-section/RightSection', () => ({
    RightSection: () => (
        <div data-testid="right-section">
            <div>Реквізити для донатів в Україні</div>
            <div>Інші варіанти підтримки</div>
        </div>
    ),
}));

jest.mock('../../../components/public/faq-section/FaqSection', () => ({
    FaqSection: ({ slug }: { slug: string }) => (
        <div data-testid="faq-section" data-slug={slug}>
            FAQ Section
        </div>
    ),
}));

jest.mock('../../../const/public/faq', () => ({
    PAGE_SLUGS: {
        DONATE: 'donate-page',
    },
}));

describe('DonatePage', () => {
    const expectMainSectionsToBeInDocument = () => {
        expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();
        expect(screen.getByTestId('donate-section')).toBeInTheDocument();
        expect(screen.getByTestId('right-section')).toBeInTheDocument();
        expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    };

    const expectCorrectDOMStructure = () => {
        const donatePage = screen.getByTestId('donate-page-intro').closest('.donatePage');
        expect(donatePage).toBeInTheDocument();

        const donatePageContent = donatePage?.querySelector('.donatePageContent');
        expect(donatePageContent).toBeInTheDocument();

        const stickyBlock = donatePageContent?.querySelector('.stickyBlock');
        expect(stickyBlock).toBeInTheDocument();
        expect(stickyBlock).toContainElement(screen.getByTestId('donate-section'));
    };

    describe('component rendering', () => {
        it('renders all main components in correct order', () => {
            render(<DonatePage />);

            expectMainSectionsToBeInDocument();

            const container = screen.getByTestId('donate-page-intro').closest('.donatePage');
            const children = container?.children;

            expect(children?.[0]).toContainElement(screen.getByTestId('donate-page-intro'));
            expect(children?.[1]).toHaveClass('donatePageContent');
            expect(children?.[2]).toContainElement(screen.getByTestId('faq-section'));
        });

        it('renders DonatePageIntro with correct heading', () => {
            render(<DonatePage />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('МИ ВДЯЧНІ');
        });

        it('renders DonateSection with form elements', () => {
            render(<DonatePage />);

            expect(screen.getByTestId('donate-section-form')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Донатити/i })).toBeInTheDocument();
        });

        it('renders RightSection with payment details', () => {
            render(<DonatePage />);

            expect(screen.getByText(/Реквізити для донатів в Україні/i)).toBeInTheDocument();
            expect(screen.getByText(/Інші варіанти підтримки/i)).toBeInTheDocument();
        });

        it('renders FaqSection with correct slug', () => {
            render(<DonatePage />);

            const faqSection = screen.getByTestId('faq-section');
            expect(faqSection).toBeInTheDocument();
            expect(faqSection).toHaveAttribute('data-slug', 'donate-page');
        });
    });

    describe('section content', () => {
        it('renders all expected text content', () => {
            render(<DonatePage />);

            expect(screen.getByText(/МИ ВДЯЧНІ/i)).toBeInTheDocument();
            expect(screen.getByText(/ЗА КОЖЕН ДОНАТ/i)).toBeInTheDocument();

            expect(screen.getByText(/Разовий донат/i)).toBeInTheDocument();
            expect(screen.getByText(/Підписка/i)).toBeInTheDocument();

            expect(screen.getByText(/Реквізити для донатів в Україні/i)).toBeInTheDocument();
            expect(screen.getByText(/Інші варіанти підтримки/i)).toBeInTheDocument();

            expect(screen.getByText('FAQ Section')).toBeInTheDocument();
        });

        it('renders donate tab options', () => {
            render(<DonatePage />);

            expect(screen.getByText('Разовий донат')).toBeInTheDocument();
            expect(screen.getByText('Підписка')).toBeInTheDocument();
        });

        it('renders donate button', () => {
            render(<DonatePage />);

            const donateButton = screen.getByRole('button', { name: /Донатити/i });
            expect(donateButton).toBeInTheDocument();
        });
    });

    describe('DOM structure', () => {
        it('has correct CSS classes and structure', () => {
            render(<DonatePage />);

            expectCorrectDOMStructure();
        });

        it('places DonateSection inside sticky block', () => {
            render(<DonatePage />);

            const stickyBlock = screen.getByTestId('donate-section').closest('.stickyBlock');
            expect(stickyBlock).toBeInTheDocument();
            expect(stickyBlock?.parentElement).toHaveClass('donatePageContent');
        });

        it('places RightSection alongside sticky block', () => {
            render(<DonatePage />);

            const rightSection = screen.getByTestId('right-section');
            const donatePageContent = rightSection.closest('.donatePageContent');
            expect(donatePageContent).toBeInTheDocument();

            const stickyBlock = donatePageContent?.querySelector('.stickyBlock');
            expect(stickyBlock).toBeInTheDocument();
            expect(donatePageContent).toContainElement(rightSection);
        });
    });

    describe('component integration', () => {
        it('renders all headings with proper hierarchy', () => {
            render(<DonatePage />);

            const headings = screen.getAllByRole('heading');
            expect(headings.length).toBeGreaterThan(0);

            expect(headings[0]).toHaveTextContent(/МИ ВДЯЧНІ/i);
            expect(headings[0].tagName).toBe('H1');
        });

        it('renders interactive elements', () => {
            render(<DonatePage />);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);

            const donateButton = buttons.find((button) => button.textContent?.includes('Донатити'));
            expect(donateButton).toBeInTheDocument();
        });
    });

    describe('component props', () => {
        it('passes correct slug to FaqSection', () => {
            render(<DonatePage />);

            const faqSection = screen.getByTestId('faq-section');
            expect(faqSection).toHaveAttribute('data-slug', 'donate-page');
        });

        it('renders without any required props', () => {
            expect(() => render(<DonatePage />)).not.toThrow();

            expectMainSectionsToBeInDocument();
        });
    });
});
