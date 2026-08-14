import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslationControls } from './TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const mockTargetLocale = 'en';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => (
        <button
            data-testid="generate-btn"
            className={props.className}
            disabled={props.disabled}
            onClick={props.onClick}
            type={props.type}
        >
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

    it('renders the generate button as disabled and hidden by default', () => {
        render(<TranslationControls {...defaultProps} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disable');
    });

    it('keeps the generate button hidden regardless of generateDisabled when hideGenerateButton is not overridden', () => {
        render(<TranslationControls {...defaultProps} generateDisabled={false} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeEnabled();
        expect(button).toHaveClass('disable');
    });

    it('shows the generate button as disabled (not hidden) when hideGenerateButton is false and generateDisabled is true', () => {
        render(<TranslationControls {...defaultProps} hideGenerateButton={false} generateDisabled={true} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeDisabled();
        expect(button).not.toHaveClass('disable');
    });

    it('shows the generate button as enabled when hideGenerateButton and generateDisabled are both false', () => {
        render(<TranslationControls {...defaultProps} hideGenerateButton={false} generateDisabled={false} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeEnabled();
        expect(button).not.toHaveClass('disable');
    });

    it.skip('disables the button when isSubmitting is true', () => {
        render(<TranslationControls {...defaultProps} isSubmitting={true} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeDisabled();
    });

    it.skip('enables the button when isSubmitting is false', () => {
        render(<TranslationControls {...defaultProps} isSubmitting={false} />);

        const button = screen.getByTestId('generate-btn');
        expect(button).toBeEnabled();
    });

    it.skip('calls onGenerate when button is clicked', () => {
        const onGenerateMock = jest.fn();
        render(<TranslationControls {...defaultProps} onGenerate={onGenerateMock} />);

        const button = screen.getByTestId('generate-btn');
        fireEvent.click(button);

        expect(onGenerateMock).toHaveBeenCalledTimes(1);
    });
    it('calls onLanguageChange when a new language is selected', () => {
        const languages = [
            { id: 1, code: 'fr', name: 'French' },
            { id: 2, code: 'en', name: 'English' },
        ];
        const onLanguageChangeMock = jest.fn();

        render(<TranslationControls {...defaultProps} languages={languages} onLanguageChange={onLanguageChangeMock} />);
        const select = screen.getByTestId('language-select');
        fireEvent.click(select);
        expect(onLanguageChangeMock).toHaveBeenCalledWith(languages[1]);
    });

    it('does not call onLanguageChange when selected code is unavailable', () => {
        const onLanguageChangeMock = jest.fn();

        render(
            <TranslationControls
                {...defaultProps}
                languages={[{ id: 1, code: 'fr', name: 'French' }]}
                onLanguageChange={onLanguageChangeMock}
            />,
        );

        fireEvent.click(screen.getByTestId('language-select'));

        expect(onLanguageChangeMock).not.toHaveBeenCalled();
    });

    it('does not render language select before language is selected', () => {
        render(<TranslationControls {...defaultProps} selectedLanguage={null} />);

        expect(screen.queryByTestId('language-select')).not.toBeInTheDocument();
    });

    it.skip('does not crash if onGenerate is undefined and button is clicked', () => {
        render(<TranslationControls {...defaultProps} onGenerate={undefined} />);

        const button = screen.getByTestId('generate-btn');
        expect(() => fireEvent.click(button)).not.toThrow();
    });
});
