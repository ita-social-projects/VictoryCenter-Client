import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Link } from './Link';
import { DEFAULT_LOCALE } from '@/const/common/locales';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

const mockedUseLocale = useLocale as jest.Mock;

const renderLink = (to: string, children: string) => {
    render(
        <MemoryRouter>
            <Link to={to}>{children}</Link>
        </MemoryRouter>,
    );
};

describe('Link component', () => {
    beforeEach(() => {
        mockedUseLocale.mockReturnValue({
            currentLanguage: 'en',
        });
    });

    test('renders with default locale', () => {
        mockedUseLocale.mockReturnValue({
            currentLanguage: DEFAULT_LOCALE,
        });
        renderLink('/programs', 'Programs');
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/programs');
    });
    test('renders path with aldready localized prefix', () => {
        renderLink('/en', 'home');
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/en');
    });
    test('renders root path with non-default locale', () => {
        renderLink('/', 'home');
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/en');
    });
    test('renders with non-default locale for move throw pages', () => {
        renderLink('/donate', 'Donate');
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/en/donate');
    });
});
