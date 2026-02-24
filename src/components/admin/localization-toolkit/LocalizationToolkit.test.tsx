import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationToolkit } from './LocalizationToolkit';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { LOCALIZATION_TEXT } from '@/const/admin/localization';
import { TranslationStatusFilter } from '@/types/common/language';
import { mapLabelToTranslationStatusFilter } from '@/utils/functions/mappers/admin/localization-status/localization-status-mappers';

jest.mock('@/components/common/select/Select', () => ({
    Select: require('@/utils/test-mocks/test-mocks').MockSelect,
}));

jest.mock('@/components/admin/language-toolkit/LanguageToolkit', () => ({
    LanguageToolkit: ({ onLanguageChange, languages }: any) => (
        <div data-testid="mock-language-toolkit">Mock Language Toolkit</div>
    ),
}));

const mockLanguages = [
    { id: 1, code: DEFAULT_LOCALE, name: 'Українська' },
    { id: 2, code: 'en', name: 'Англійська' },
];

describe('LocalizationToolkit', () => {
    const mockOnLanguageChange = jest.fn();
    const mockOnTranslationStatusChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders container correctly', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        expect(screen.getByTestId('localization-toolkit')).toBeInTheDocument();
        expect(screen.getByTestId('mock-language-toolkit')).toBeInTheDocument();
    });

    it('automatically selects "All" status on mount', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        expect(mockOnTranslationStatusChange).toHaveBeenCalledWith(TranslationStatusFilter.All);
    });

    it('renders all translation status options', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        Object.values(LOCALIZATION_TEXT.FILTER.STATUS).forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('calls onTranslationStatusFilterChange when status is changed', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        const statusSelect = screen.getByRole('combobox');

        const firstStatusLabel = Object.values(LOCALIZATION_TEXT.FILTER.STATUS)[0];
        const expectedValue = mapLabelToTranslationStatusFilter(firstStatusLabel);

        fireEvent.change(statusSelect, {
            target: { value: String(expectedValue) },
        });

        expect(mockOnTranslationStatusChange).toHaveBeenCalledWith(expectedValue);
    });
});
