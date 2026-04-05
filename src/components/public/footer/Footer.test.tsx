import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';
import { MemoryRouter } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import footerUk from '@/locales/uk/footer.json';
import { getPublicCompanyProfile } from '@/services/api/public/company-profile/company-profile-api';

jest.mock('@/services/api/public/company-profile/company-profile-api', () => ({
    getPublicCompanyProfile: jest.fn(),
}));

jest.mock('@/assets/icons/logo-with-text.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="victory-logo" />,
}));

jest.mock('@/assets/icons/phone.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="phone-icon" />,
}));

jest.mock('@/assets/icons/mail.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="mail-icon" />,
}));

const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('Footer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (navigator.clipboard.writeText as jest.Mock).mockClear();
    });

    it('renders the logo and icons', () => {
        (getPublicCompanyProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));

        render(<Footer />, { wrapper: MemoryRouter });

        expect(screen.getByTestId('victory-logo')).toBeInTheDocument();
        expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
        expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
    });

    it('renders the menu section with correct links', () => {
        (getPublicCompanyProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));

        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByText(footerUk['MENU'])).toBeInTheDocument();

        expect(screen.getByRole('link', { name: footerUk['REPORTING'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.REPORTS.FULL,
        );

        const howToSupportLink = screen.getByRole('link', { name: footerUk['HOW_TO_SUPPORT'] });
        expect(howToSupportLink).toHaveAttribute('href', PUBLIC_ROUTES.MOCK.FULL);
        expect(howToSupportLink).toHaveClass('disable');

        expect(screen.getByRole('link', { name: footerUk['STORIES_OF_VICTORIES'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders the about us section with correct links', () => {
        (getPublicCompanyProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));

        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getAllByText(footerUk['ABOUT_US'])[1]).toBeInTheDocument();

        expect(screen.getByRole('link', { name: footerUk['ABOUT_US'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.ABOUT_US.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['OUR_HISTORY'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['OUR_TEAM'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.TEAM.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['PARTNERS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.PARTNERS.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['EVENTS_AND_NEWS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('renders the hippotherapy section with correct links', () => {
        (getPublicCompanyProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));

        render(<Footer />, { wrapper: MemoryRouter });
        expect(screen.getByText(footerUk['HIPPOTHERAPY'])).toBeInTheDocument();

        expect(screen.getByRole('link', { name: footerUk['WHAT_IS_HIPPOTHERAPY'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.HIPPOTHERAPY.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['PROGRAMS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.PROGRAMS.FULL,
        );
        expect(screen.getByRole('link', { name: footerUk['PROGRAMS_SESSIONS'] })).toHaveAttribute(
            'href',
            PUBLIC_ROUTES.MOCK.FULL,
        );
    });

    it('fallback: renders contact buttons from i18n and no social links when API fails', async () => {
        (getPublicCompanyProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));

        render(<Footer />, { wrapper: MemoryRouter });

        expect(
            screen.getByRole('button', { name: new RegExp(escapeRegExp(footerUk['EMAIL']), 'i') }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: new RegExp(escapeRegExp(footerUk['PHONE']), 'i') }),
        ).toBeInTheDocument();

        expect(screen.queryByRole('button', { name: /facebook/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /telegram/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /instagram/i })).not.toBeInTheDocument();
    });

    it('copies email to clipboard on click (fallback mode)', () => {
        (getPublicCompanyProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));

        render(<Footer />, { wrapper: MemoryRouter });

        const emailButton = screen.getByRole('button', {
            name: new RegExp(escapeRegExp(footerUk['EMAIL']), 'i'),
        });

        fireEvent.click(emailButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(footerUk['EMAIL']);
    });

    it('copies phone to clipboard on click (fallback mode)', () => {
        (getPublicCompanyProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));

        render(<Footer />, { wrapper: MemoryRouter });

        const phoneButton = screen.getByRole('button', {
            name: new RegExp(escapeRegExp(footerUk['PHONE']), 'i'),
        });

        fireEvent.click(phoneButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(footerUk['PHONE']);
    });

    it('API success: renders contacts and social links from API and opens correct URL', async () => {
        (getPublicCompanyProfile as jest.Mock).mockResolvedValueOnce({
            contacts: {
                email: 'api@email.com',
                phone: '+380 00 111 22 33',
                motto: 'UA motto',
                localizations: [{ localizationInfoDto: { code: 'en' }, motto: 'EN motto' }],
            },
            socialLinks: [
                { socialPlatform: 1, url: 'https://facebook.com/from-api' },
                { socialPlatform: 0, url: 'https://instagram.com/from-api' },
            ],
        });

        render(<Footer />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText('api@email.com')).toBeInTheDocument();
        });

        expect(screen.getByText('+380 00 111 22 33')).toBeInTheDocument();

        const fbButton = screen.getByRole('button', { name: /facebook/i });
        fireEvent.click(fbButton);
        expect(openSpy).toHaveBeenCalledWith('https://facebook.com/from-api', '_blank', 'noopener,noreferrer');
    });
});
