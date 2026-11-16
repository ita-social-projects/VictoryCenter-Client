import { screen } from '@testing-library/react';
import {
    DEFAULT_LOCALE,
    LOCALES,
    DEFAULT_UKRAINIAN_LANGUAGE_ID,
    DEFAULT_ENGLISH_LANGUAGE_ID,
} from '@/const/common/locales';
import { LocalizationLanguage, EntityLocalization, TranslationStatus } from '@/types/common/language';
import { ReactNode } from 'react';
import { HippotherapyReadOnlyContext } from '@/pages/admin/hippotherapy-page/context/HippotherapyReadOnlyContext';

export const mockTranslationLanguages: LocalizationLanguage[] = [
    {
        id: DEFAULT_UKRAINIAN_LANGUAGE_ID,
        code: DEFAULT_LOCALE,
        name: 'Primary Language',
    },
    {
        id: DEFAULT_ENGLISH_LANGUAGE_ID,
        code: LOCALES.find((l) => l !== DEFAULT_LOCALE) ?? 'en',
        name: 'Secondary Language',
    },
];

export const mockLocalizations: EntityLocalization[] = [
    {
        language: mockTranslationLanguages[1],
        translationStatus: TranslationStatus.Relevant,
    } as EntityLocalization,
];

export const itRendersTranslationStatuses = (renderComponent: (props?: any) => void) => {
    it('renders translation statuses when translationLanguages and localizations are provided', () => {
        renderComponent({
            translationLanguages: mockTranslationLanguages,
            localizations: mockLocalizations,
        });

        const statuses = screen.getByTestId('localization-statuses');
        expect(statuses).toBeInTheDocument();
        expect(statuses).toHaveAttribute('data-languages-count', String(mockTranslationLanguages.length));
        expect(statuses).toHaveAttribute('data-localizations-count', String(mockLocalizations.length));
    });

    it('does not render translation statuses when translationLanguages is not provided', () => {
        renderComponent({
            translationLanguages: undefined,
            localizations: undefined,
        });

        expect(screen.queryByTestId('localization-statuses')).not.toBeInTheDocument();
    });
};

export const withReadOnlyContext = (ui: ReactNode, isReadOnly: boolean) => (
    <HippotherapyReadOnlyContext.Provider value={isReadOnly}>{ui}</HippotherapyReadOnlyContext.Provider>
);

export const itHidesToolbarWhenReadOnly = (
    renderSection: (isReadOnly: boolean) => unknown,
    richInputTestIds: string[],
) => {
    describe('read-only mode toolbar', () => {
        it('shows toolbar when isReadOnly is false', () => {
            renderSection(false);

            richInputTestIds.forEach((testId) => {
                expect(screen.getByTestId(testId)).toHaveAttribute('data-hide-toolbar', 'false');
            });
        });

        it('hides toolbar when isReadOnly is true', () => {
            renderSection(true);

            richInputTestIds.forEach((testId) => {
                expect(screen.getByTestId(testId)).toHaveAttribute('data-hide-toolbar', 'true');
            });
        });
    });
};
