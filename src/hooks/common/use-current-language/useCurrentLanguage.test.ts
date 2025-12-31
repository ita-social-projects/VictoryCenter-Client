import { renderHook } from '@testing-library/react';
import { useCurrentLanguage } from './useCurrentLanguage';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

const mockedUseTranslation = useTranslation as jest.Mock;

describe('useCurrentLanguage', () => {
    it('returns current language: uk', () => {
        mockedUseTranslation.mockReturnValue({
            i18n: {
                language: 'uk',
            },
        });

        const { result } = renderHook(() => useCurrentLanguage());

        expect(result.current).toBe('uk');
    });

    it('returns current language: en', () => {
        mockedUseTranslation.mockReturnValue({
            i18n: {
                language: 'en',
            },
        });

        const { result } = renderHook(() => useCurrentLanguage());

        expect(result.current).toBe('en');
    });
});
