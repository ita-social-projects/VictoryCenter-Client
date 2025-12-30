import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationToolkit } from './LocalizationToolkit';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { LOCALIZATION_TEXT } from '@/const/admin/localization';
import { TranslationStatusFilter } from '@/types/common/language';
import { mapLabelToTranslationStatusFilter } from '@/utils/functions/mappers/admin/localization-status/localization-status-mappers';

jest.mock('@/components/common/select/Select', () => {
    const MockOption = ({ value, name, ...props }: any) => (
        <option value={typeof value === 'object' ? JSON.stringify(value) : value} {...props}>
            {name}
        </option>
    );

    const MockSelect = ({ children, onValueChange, ...props }: any) => {
        const handleChange = (e: any) => {
            let val: any = e.target.value;

            try {
                val = JSON.parse(val);
            } catch {}

            onValueChange(val);
        };

        return (
            <select data-testid={props['data-testid'] || 'select'} onChange={handleChange}>
                {children}
            </select>
        );
    };

    MockSelect.Option = MockOption;
    return { Select: MockSelect };
});

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
    });

    it('automatically selects default language and "All" status on mount', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        const expectedDefault = mockLanguages.find((l) => l.code === DEFAULT_LOCALE) || mockLanguages[0];

        expect(mockOnLanguageChange).toHaveBeenCalledWith(expectedDefault);
        expect(mockOnTranslationStatusChange).toHaveBeenCalledWith(TranslationStatusFilter.All);
    });

    it('renders all language options', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        mockLanguages.forEach((lang) => {
            expect(screen.getByText(lang.name)).toBeInTheDocument();
        });
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

    it('calls onLanguageChange when language is changed', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        const selects = screen.getAllByRole('combobox');
        const languageSelect = selects[0];

        fireEvent.change(languageSelect, {
            target: { value: JSON.stringify(mockLanguages[1]) },
        });

        expect(mockOnLanguageChange).toHaveBeenCalledWith(mockLanguages[1]);
    });

    it('calls onTranslationStatusFilterChange when status is changed', () => {
        render(
            <LocalizationToolkit
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
                onTranslationStatusFilterChange={mockOnTranslationStatusChange}
            />,
        );

        const selects = screen.getAllByRole('combobox');
        const statusSelect = selects[1];

        const firstStatusLabel = Object.values(LOCALIZATION_TEXT.FILTER.STATUS)[0];
        const expectedValue = mapLabelToTranslationStatusFilter(firstStatusLabel);

        fireEvent.change(statusSelect, {
            target: { value: String(expectedValue) },
        });

        expect(mockOnTranslationStatusChange).toHaveBeenCalledWith(expectedValue);
    });
});
