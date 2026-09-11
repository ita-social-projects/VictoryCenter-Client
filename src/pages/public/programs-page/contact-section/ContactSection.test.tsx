import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactSection } from './ContactSection';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                PROGRAM_PROMPT: 'Не впевнені, яка програма підійде саме вам?',
                TEXT_US:
                    'Напишіть нам — ми разом підберемо те, що найкраще відповідає вашим потребам або потребам вашої дитини.',
                CONTACT: 'Звʼязатись з нами',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock('./contact-form-pop-up/ContactFormPopUp', () => ({
    ContactFormPopUp: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="mock-popup">
                <button onClick={onClose}> Close Mock Popup </button>
            </div>
        ) : null,
}));

describe('ContactSection', () => {
    test('should render correctly', () => {
        render(<ContactSection />);
        const title = screen.getByRole('heading', { name: 'Не впевнені, яка програма підійде саме вам?' });
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('contact-title');

        const subtitle = screen.getByRole('heading', {
            name:
                'Напишіть нам — ми разом підберемо те, ' +
                'що найкраще відповідає вашим потребам або потребам вашої дитини.',
        });
        expect(subtitle).toBeInTheDocument();

        const button = screen.getByRole('button', { name: 'Звʼязатись з нами' });
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

    test('should have correct container name', () => {
        const { container } = render(<ContactSection />);
        expect(container.querySelector('.contact-us-block')).toBeInTheDocument();
        const videoElement = document.querySelector('video')?.closest('.contact-us-block');
        expect(videoElement).toBeInTheDocument();
    });

    describe('Popup interactions', () => {
        test('popup is closed by default', () => {
            render(<ContactSection />);
            expect(screen.queryByTestId('mock-popup')).not.toBeInTheDocument();
        });

        test('opens popup when contact button is clicked', () => {
            render(<ContactSection />);

            const button = screen.getByRole('button', { name: 'Звʼязатись з нами' });
            fireEvent.click(button);

            expect(screen.getByTestId('mock-popup')).toBeInTheDocument();
        });

        test('closes popup when onClose is triggered from popup', () => {
            render(<ContactSection />);

            const button = screen.getByRole('button', { name: 'Звʼязатись з нами' });
            fireEvent.click(button);

            const mockCloseButton = screen.getByRole('button', { name: 'Close Mock Popup' });
            fireEvent.click(mockCloseButton);

            expect(screen.queryByTestId('mock-popup')).not.toBeInTheDocument();
        });
    });
});
