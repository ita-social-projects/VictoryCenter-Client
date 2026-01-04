import { renderHook, act } from '@testing-library/react';
import { useLocale } from './useLocale';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

const mockedUseTranslation = useTranslation as jest.Mock;

describe('useLocale hook', () => {
    const mockChangeLanguage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return correct initial values for "uk" language', () => {
        mockedUseTranslation.mockReturnValue({
            i18n: {
                language: 'uk',
                changeLanguage: mockChangeLanguage,
            },
        });

        const { result } = renderHook(() => useLocale());

        expect(result.current.currentLanguage).toBe('uk');
        expect(result.current.isUk).toBe(true);
        expect(result.current.isEn).toBe(false);
    });

    it('should return correct initial values for "en" language', () => {
        mockedUseTranslation.mockReturnValue({
            i18n: {
                language: 'en',
                changeLanguage: mockChangeLanguage,
            },
        });

        const { result } = renderHook(() => useLocale());

        expect(result.current.currentLanguage).toBe('en');
        expect(result.current.isUk).toBe(false);
        expect(result.current.isEn).toBe(true);
    });

    it('should call i18n.changeLanguage when changeLocaleLanguage is executed', () => {
        mockedUseTranslation.mockReturnValue({
            i18n: {
                language: 'uk',
                changeLanguage: mockChangeLanguage,
            },
        });

        const { result } = renderHook(() => useLocale());

        act(() => {
            result.current.changeLanguage('en');
        });

        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
        expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    });
});
