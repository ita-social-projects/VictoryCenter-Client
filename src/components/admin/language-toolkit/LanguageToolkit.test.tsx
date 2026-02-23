import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageToolkit } from './LanguageToolkit';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { LOCALIZATION_TEXT } from '@/const/admin/localization';

jest.mock('@/components/common/select/Select', () => {
    const MockOption = ({ value, name, ...props }: any) => (
        <option value={typeof value === 'object' ? JSON.stringify(value) : value} {...props}>
            {name}
        </option>
    );

    const MockSelect = ({ children, onValueChange, ...props }: any) => {
        const handleChange = (e: any) => {
            let val: any = e.target.value;
            try { val = JSON.parse(val); } catch { }
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

describe('LanguageToolkit', () => {
    const mockOnLanguageChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders container correctly', () => {
        render(<LanguageToolkit languages={mockLanguages} onLanguageChange={mockOnLanguageChange} />);
        expect(screen.getByTestId('language-toolkit')).toBeInTheDocument();
    });

    it('automatically selects default language on mount', () => {
        render(<LanguageToolkit languages={mockLanguages} onLanguageChange={mockOnLanguageChange} />);
        const expectedDefault = mockLanguages.find((l) => l.code === DEFAULT_LOCALE) || mockLanguages[0];
        expect(mockOnLanguageChange).toHaveBeenCalledWith(expectedDefault);
    });

    it('renders all language options', () => {
        render(<LanguageToolkit languages={mockLanguages} onLanguageChange={mockOnLanguageChange} />);
        mockLanguages.forEach((lang) => {
            expect(screen.getByText(lang.name)).toBeInTheDocument();
        });
    });

    it('calls onLanguageChange when language is changed', () => {
        render(<LanguageToolkit languages={mockLanguages} onLanguageChange={mockOnLanguageChange} />);
        const languageSelect = screen.getByRole('combobox');

        fireEvent.change(languageSelect, {
            target: { value: JSON.stringify(mockLanguages[1]) },
        });

        expect(mockOnLanguageChange).toHaveBeenCalledWith(mockLanguages[1]);
    });
});
