import { renderHook, act } from '@testing-library/react';
import { useLocale } from './useLocale';
import { useLocation } from 'react-router-dom';
import { DEFAULT_LOCALE } from '@/const/common/locales';

const mockChangeLanguage = jest.fn();
const mockNavigate = jest.fn();
let mockCurrentLanguage = 'uk';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        i18n: {
            language: mockCurrentLanguage,
            resolvedLanguage: mockCurrentLanguage,
            changeLanguage: mockChangeLanguage,
        },
    }),
}));

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: jest.fn(),
}));

describe('useLocale hook', () => {
    const setupLocation = (pathname = '/', search = '') => {
        (useLocation as jest.Mock).mockReturnValue({ pathname, search });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentLanguage = 'uk';
        setupLocation();
    });

    it('should NOT call anything if new language is same as current', () => {
        const { result } = renderHook(() => useLocale());
        act(() => {
            result.current.changeLanguage('uk');
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    describe('Navigation and path transformation', () => {
        test.each([
            ['uk', '/about', '', 'en', '/en/about'],
            ['en', '/en/about', '', DEFAULT_LOCALE, '/about'],
            ['en', '/en', '', DEFAULT_LOCALE, '/'],
            ['uk', '/products', '?id=123', 'en', '/en/products?id=123'],
        ])('from %s at %s%s to %s should navigate to %s', (currentLang, path, search, nextLang, expectedPath) => {
            mockCurrentLanguage = currentLang;
            setupLocation(path, search);

            const { result } = renderHook(() => useLocale());
            act(() => {
                result.current.changeLanguage(nextLang);
            });

            expect(mockNavigate).toHaveBeenCalledWith(expectedPath, { replace: true });
        });
    });

    it('should correctly identify language boolean flags', () => {
        const { result, rerender } = renderHook(() => useLocale());

        mockCurrentLanguage = 'uk';
        rerender();
        expect(result.current.isUk).toBe(true);

        mockCurrentLanguage = 'en';
        rerender();
        expect(result.current.isEn).toBe(true);
    });
});
