import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { Link } from './Link';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

describe('Link component', () => {
    const setup = (to: string, lang: string) => {
        (useLocale as jest.Mock).mockReturnValue({ currentLanguage: lang });
        render(
            <MemoryRouter>
                <Link to={to}>Test</Link>
            </MemoryRouter>,
        );

        return screen.getByRole('link');
    };

    test('renders with default locale', () => {
        expect(setup('/programs', DEFAULT_LOCALE)).toHaveAttribute('href', '/programs');
    });

    test('renders path with already localized prefix', () => {
        expect(setup('/en', 'en')).toHaveAttribute('href', '/en');
    });

    test('renders root path with non-default locale', () => {
        expect(setup('/', 'en')).toHaveAttribute('href', '/en');
    });

    test('renders with non-default locale for move throw pages', () => {
        expect(setup('/donate', 'en')).toHaveAttribute('href', '/en/donate');
    });
});
