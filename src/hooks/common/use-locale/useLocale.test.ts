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
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentLanguage = 'uk';
        (useLocation as jest.Mock).mockReturnValue({
            pathname: '/',
            search: '',
        });
    });

    it('should NOT call anything if new language is same as current', () => {
        const { result } = renderHook(() => useLocale());
        act(() => {
            result.current.changeLanguage('uk');
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should add locale prefix when switching from default to non-default', () => {
        (useLocation as jest.Mock).mockReturnValue({
            pathname: '/about',
            search: '',
        });

        const { result } = renderHook(() => useLocale());
        act(() => {
            result.current.changeLanguage('en');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/en/about', { replace: true });
    });

    it('should remove locale prefix when switching to default locale', () => {
        mockCurrentLanguage = 'en';

        (useLocation as jest.Mock).mockReturnValue({
            pathname: '/en/about',
            search: '',
        });

        const { result } = renderHook(() => useLocale());
        act(() => {
            result.current.changeLanguage(DEFAULT_LOCALE);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/about', { replace: true });
    });

    it('should handle root path correctly when switching to default', () => {
        mockCurrentLanguage = 'en';

        (useLocation as jest.Mock).mockReturnValue({
            pathname: '/en',
            search: '',
        });

        const { result } = renderHook(() => useLocale());
        act(() => {
            result.current.changeLanguage(DEFAULT_LOCALE);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should keep search parameters after language change', () => {
        (useLocation as jest.Mock).mockReturnValue({
            pathname: '/products',
            search: '?id=123',
        });

        const { result } = renderHook(() => useLocale());
        act(() => {
            result.current.changeLanguage('en');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/en/products?id=123', { replace: true });
    });

    it('should correctly identify language with isUk and isEn', () => {
        mockCurrentLanguage = 'uk';
        const { result, rerender } = renderHook(() => useLocale());
        expect(result.current.isUk).toBe(true);

        mockCurrentLanguage = 'en';
        rerender();
        expect(result.current.isEn).toBe(true);
    });
});
