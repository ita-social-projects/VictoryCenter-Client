import { render, screen, fireEvent } from '@testing-library/react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { LocalizationLanguage } from '@/types/common/language';
import { TranslateDisclaimerModal } from './TranslateDisclaimerModal';

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({ languages, selectedLanguage, onLanguageChange }: any) => (
        <div data-testid="translation-controls">
            {languages.map((lang: any) => (
                <button
                    key={lang.id}
                    data-testid={`lang-${lang.code}`}
                    onClick={() => onLanguageChange(lang)}
                    data-selected={selectedLanguage?.id === lang.id}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: ({ isOpen, onClose, title, onSave, isSubmitting, isFormValid, isDirty, children }: any) =>
        isOpen ? (
            <div data-testid="localization-modal">
                <div data-testid="modal-title">{title}</div>
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
                <button data-testid="modal-save" onClick={onSave} disabled={!isFormValid || isSubmitting || !isDirty}>
                    Save
                </button>
                <div data-testid="modal-content">{children}</div>
            </div>
        ) : null,
}));

jest.mock('./TranslateDisclaimerForm', () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react');
    const TranslateDisclaimerForm = forwardRef(
        ({ onValidationChange, onSubmit, onDirtyChange, formDisabled }: any, ref: any) => {
            useImperativeHandle(ref, () => ({
                isValid: () => true,
                isDirty: () => true,
                submit: () => onSubmit({ description: 'Test description text' }),
            }));
            return (
                <div data-testid="translate-disclaimer-form">
                    <button
                        data-testid="make-valid"
                        onClick={() => {
                            onValidationChange?.(true);
                            onDirtyChange?.(true);
                        }}
                    >
                        Make valid
                    </button>
                    <span data-testid="form-disabled">{String(formDisabled)}</span>
                </div>
            );
        },
    );
    return { TranslateDisclaimerForm };
});

const languageEn: LocalizationLanguage = { id: 2, code: 'en', name: 'Англійська' };
const languageUk: LocalizationLanguage = { id: 1, code: 'uk', name: 'Українська' };

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    translationLanguages: [languageEn],
};

describe('TranslateDisclaimerModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders modal when isOpen is true', () => {
        render(<TranslateDisclaimerModal {...defaultProps} />);

        expect(screen.getByTestId('localization-modal')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(<TranslateDisclaimerModal {...defaultProps} isOpen={false} />);

        expect(screen.queryByTestId('localization-modal')).not.toBeInTheDocument();
    });

    it('renders add-mode title', () => {
        render(<TranslateDisclaimerModal {...defaultProps} />);

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.TITLE,
        );
    });

    it('renders TranslationControls with provided languages', () => {
        render(<TranslateDisclaimerModal {...defaultProps} translationLanguages={[languageEn, languageUk]} />);

        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
        expect(screen.getByTestId('lang-en')).toBeInTheDocument();
        expect(screen.getByTestId('lang-uk')).toBeInTheDocument();
    });

    it('initializes selected language to first in the list', () => {
        render(<TranslateDisclaimerModal {...defaultProps} translationLanguages={[languageEn, languageUk]} />);

        expect(screen.getByTestId('lang-en')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('lang-uk')).toHaveAttribute('data-selected', 'false');
    });

    it('renders TranslationControls with no languages when list is empty', () => {
        render(<TranslateDisclaimerModal {...defaultProps} translationLanguages={[]} />);

        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
    });

    it('renders the disclaimer form', () => {
        render(<TranslateDisclaimerModal {...defaultProps} />);

        expect(screen.getByTestId('translate-disclaimer-form')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();
        render(<TranslateDisclaimerModal {...defaultProps} onClose={onClose} />);

        fireEvent.click(screen.getByTestId('modal-close'));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('save button is disabled when form is not valid', () => {
        render(<TranslateDisclaimerModal {...defaultProps} />);

        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('save button is enabled after form becomes valid and dirty', () => {
        render(<TranslateDisclaimerModal {...defaultProps} />);

        fireEvent.click(screen.getByTestId('make-valid'));

        expect(screen.getByTestId('modal-save')).not.toBeDisabled();
    });

    it('resets form validity state when modal is closed and reopened', () => {
        const { rerender } = render(<TranslateDisclaimerModal {...defaultProps} />);

        fireEvent.click(screen.getByTestId('make-valid'));
        expect(screen.getByTestId('modal-save')).not.toBeDisabled();

        fireEvent.click(screen.getByTestId('modal-close'));
        rerender(<TranslateDisclaimerModal {...defaultProps} isOpen={false} />);
        rerender(<TranslateDisclaimerModal {...defaultProps} isOpen={true} />);

        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('updates selected language when language button is clicked', () => {
        render(<TranslateDisclaimerModal {...defaultProps} translationLanguages={[languageEn, languageUk]} />);

        expect(screen.getByTestId('lang-en')).toHaveAttribute('data-selected', 'true');

        fireEvent.click(screen.getByTestId('lang-uk'));

        expect(screen.getByTestId('lang-uk')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('lang-en')).toHaveAttribute('data-selected', 'false');
    });

    it('passes formDisabled=false to the form', () => {
        render(<TranslateDisclaimerModal {...defaultProps} />);

        expect(screen.getByTestId('form-disabled')).toHaveTextContent('false');
    });
});
