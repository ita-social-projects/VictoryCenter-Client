import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslationControls } from './TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const mockTargetLocale = 'en';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => (
        <button data-testid="generate-btn" disabled={props.disabled} onClick={props.onClick} type={props.type}>
            {props.children}
        </button>
    ),
}));

jest.mock('@/components/common/select/Select', () => {
    const MockSelect = ({ children, className, onValueChange }: any) => (
        <button
            data-testid="language-select"
            className={className}
            onClick={() => onValueChange(mockTargetLocale)}
            type="button"
        >
            {children}
        </button>
    );

    (MockSelect as any).Option = ({ name }: any) => <div data-testid="select-option">{name}</div>;

    return { Select: MockSelect };
});

describe('TranslationControls', () => {
    const defaultProps = {
        isSubmitting: false,
        languages: [{ id: 1, code: 'en', name: 'English' }],
        selectedLanguage: { id: 1, name: 'English', code: 'en' },
        onLanguageChange: jest.fn(),
        onGenerate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<TranslationControls {...defaultProps} />);

        expect(screen.getByTestId('language-select')).toBeInTheDocument();
        const button = screen.getByTestId('generate-btn');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION);
        expect(button).toHaveAttribute('type', 'button');
    });

    it('disables the button when isSubmitting is true', () => {
        render(<TranslationControls {...defaultProps} isSubmitting={true} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeDisabled();
    });

    it('enables the button when isSubmitting is false', () => {
        render(<TranslationControls {...defaultProps} isSubmitting={false} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeEnabled();
    });

    it('calls onGenerate when button is clicked', () => {
        const onGenerateMock = jest.fn();
        render(<TranslationControls {...defaultProps} onGenerate={onGenerateMock} />);

        const button = screen.getByTestId('generate-btn');
        fireEvent.click(button);

        expect(onGenerateMock).toHaveBeenCalledTimes(1);
    });
    it('calls onLanguageChange when a new language is selected', () => {
        const languages = [
            { id: 1, code: 'fr', name: 'French' },
            { id: 1, code: 'en', name: 'English' },
        ];
        const onLanguageChangeMock = jest.fn();

        render(<TranslationControls {...defaultProps} languages={languages} onLanguageChange={onLanguageChangeMock} />);
        const select = screen.getByTestId('language-select');
        fireEvent.click(select);
        expect(onLanguageChangeMock).toHaveBeenCalledWith(languages[1]);
    });

    it('does not crash if onGenerate is undefined and button is clicked', () => {
        render(<TranslationControls {...defaultProps} onGenerate={undefined} />);

        const button = screen.getByTestId('generate-btn');
        expect(() => fireEvent.click(button)).not.toThrow();
    });
});
