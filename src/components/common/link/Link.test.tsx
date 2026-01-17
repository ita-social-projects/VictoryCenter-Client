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
    return screen.getByRole('link');
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
        const anchor = renderLink('/programs', 'Programs');
        expect(anchor).toHaveAttribute('href', '/programs');
    });
    test('renders path with aldready localized prefix', () => {
        const anchor = renderLink('/en', 'home');
        expect(anchor).toHaveAttribute('href', '/en');
    });
    test('renders root path with non-default locale', () => {
        const anchor = renderLink('/', 'home');
        expect(anchor).toHaveAttribute('href', '/en');
    });
    test('renders with non-default locale for move throw pages', () => {
        const anchor = renderLink('/donate', 'Donate');
        expect(anchor).toHaveAttribute('href', '/en/donate');
    });
});
