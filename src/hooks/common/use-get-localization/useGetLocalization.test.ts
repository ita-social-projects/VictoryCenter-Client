import { renderHook } from '@testing-library/react';
import { useGetLocalization } from './useGetLocalization';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { EntityLocalization, TranslationStatus } from '@/types/common/language';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

const mockUseLocale = useLocale as jest.Mock;

type Localized<T extends object> = EntityLocalization & Partial<T>;

describe('useGetLocalization (uk default)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    interface Fields {
        fullName: string;
        description: string;
    }

    const fallbackUk: Fields = {
        fullName: 'Оригінальне імʼя',
        description: 'Оригінальний опис',
    };

    const enLocalizations: Localized<Fields>[] = [
        {
            language: { id: 1, code: 'en' },
            translationStatus: TranslationStatus.Relevant,
            fullName: 'English name',
            description: 'English description',
        },
    ];

    it('повертає fallback (uk), якщо поточна мова українська', () => {
        mockUseLocale.mockReturnValue({ currentLanguage: 'uk' });

        const { result } = renderHook(() => useGetLocalization(enLocalizations, fallbackUk));

        expect(result.current).toEqual({
            fullName: 'Оригінальне імʼя',
            description: 'Оригінальний опис',
        });
    });

    it('повертає англійський переклад, якщо мова en', () => {
        mockUseLocale.mockReturnValue({ currentLanguage: 'en' });

        const { result } = renderHook(() => useGetLocalization(enLocalizations, fallbackUk));

        expect(result.current).toEqual({
            fullName: 'English name',
            description: 'English description',
        });
    });

    it('повертає fallback (uk), якщо мова en, але переклад відсутній', () => {
        mockUseLocale.mockReturnValue({ currentLanguage: 'en' });

        const { result } = renderHook(() => useGetLocalization([], fallbackUk));

        expect(result.current).toEqual({
            fullName: 'Оригінальне імʼя',
            description: 'Оригінальний опис',
        });
    });

    it('повертає fallback (uk), якщо localizations є undefined', () => {
        mockUseLocale.mockReturnValue({ currentLanguage: 'en' });

        const { result } = renderHook(() => useGetLocalization(undefined, fallbackUk));

        expect(result.current).toEqual({
            fullName: 'Оригінальне імʼя',
            description: 'Оригінальний опис',
        });
    });

    it('повертає fallback (uk) коли localizations містять лише uk запис і мова en', () => {
        mockUseLocale.mockReturnValue({ currentLanguage: 'en' });

        const ukOnlyLocalizations: Localized<Fields>[] = [
            {
                language: { id: 2, code: 'uk' },
                translationStatus: TranslationStatus.Relevant,
                fullName: 'Українське імʼя',
                description: 'Український опис',
            },
        ];

        const { result } = renderHook(() => useGetLocalization(ukOnlyLocalizations, fallbackUk));

        expect(result.current).toEqual({
            fullName: 'Оригінальне імʼя',
            description: 'Оригінальний опис',
        });
    });
});
