import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TranslatePdfSectionModal } from './TranslatePdfSectionModal';
import { PdfSection, PdfSectionLocalizationDto } from '@/types/admin/pdf-section';
import { useTranslatePdfSection } from '@/hooks/admin/use-translate-pdf-section/useTranslatePdfSection';

const mockDialog = (testId: string, onClose: () => void, children: React.ReactNode) => (
    <div
        data-testid={testId}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
        }}
    >
        {children}
    </div>
);

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => require('@/utils/test-mocks/test-mocks').MockButton(props),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: (props: any) => require('@/utils/test-mocks/test-mocks').MockConfirmationModal(props),
}));

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ isOpen, children, onClose }: any) => (isOpen ? mockDialog('modal', onClose, children) : null);

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

let capturedCheckIsDirty: (() => boolean) | null = null;

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: ({ onClose, title, onSave, isSubmitting, isFormValid, checkIsDirty, children }: any) => {
        capturedCheckIsDirty = checkIsDirty;
        return mockDialog(
            'localization-modal',
            onClose,
            <>
                <div data-testid="modal-title">{title}</div>
                <div data-testid="modal-content">{children}</div>
                <button
                    data-testid="save-localization-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave();
                    }}
                    disabled={!isFormValid || isSubmitting}
                >
                    Save
                </button>
                <button data-testid="check-dirty-btn" onClick={() => checkIsDirty?.()}>
                    Check Dirty
                </button>
            </>,
        );
    },
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({ selectedLanguage, languages, onLanguageChange, isSubmitting }: any) => (
        <div data-testid="translation-controls">
            <select
                data-testid="language-select"
                value={selectedLanguage?.id || ''}
                onChange={(e) => {
                    const lang = languages.find((l: any) => l.id === Number(e.target.value));
                    onLanguageChange(lang);
                }}
                disabled={isSubmitting}
            >
                {languages.map((lang: any) => (
                    <option key={lang.id} value={lang.id}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

let mockFormIsValid = true;

jest.mock('../translate-pdf-section-form/TranslatePdfSectionForm', () => {
    const React = require('react');

    return {
        TranslatePdfSectionForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange }: any, ref: React.Ref<any>) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () =>
                        onSubmit({
                            title: 'Translated Title',
                            description: 'Translated Description',
                        }),
                    isValid: () => mockFormIsValid,
                    isDirty: () => true,
                }));

                React.useEffect(() => {
                    onValidationChange?.(mockFormIsValid);
                    onDirtyChange?.(true);
                }, [onValidationChange, onDirtyChange]);

                return <div data-testid="translate-form" />;
            },
        ),
    };
});

const mockTranslatePdfSection = jest.fn();
jest.mock('@/hooks/admin/use-translate-pdf-section/useTranslatePdfSection', () => ({
    useTranslatePdfSection: jest.fn(() => ({
        translatePdfSection: mockTranslatePdfSection,
        isSubmitting: false,
        error: '',
    })),
}));

const mockUseTranslatePdfSection = jest.mocked(useTranslatePdfSection);

const mockHookReturn = (overrides = {}) =>
    mockUseTranslatePdfSection.mockReturnValue({
        translatePdfSection: mockTranslatePdfSection,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
        ...overrides,
    });

const TEST_DATA = {
    pdfSection: {
        title: 'Original Title',
        description: 'Original Description',
        localizations: [],
    } as PdfSection,
    translatedLanguages: [
        {
            id: 1,
            code: 'uk',
            name: 'Ukrainian',
        },
        {
            id: 2,
            code: 'en',
            name: 'English',
        },
    ],
    translatedData: {
        title: 'Translated Title',
        description: 'Translated Description',
    },
};

describe('TranslatePdfSectionModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        pdfSection: TEST_DATA.pdfSection,
        onTranslatePdfSection: jest.fn(),
        translatedLanguages: TEST_DATA.translatedLanguages,
    };

    const renderModal = (props: Partial<React.ComponentProps<typeof TranslatePdfSectionModal>> = {}) =>
        render(<TranslatePdfSectionModal {...defaultProps} {...props} />);

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslatePdfSection.mockResolvedValue(undefined);
        mockHookReturn();
        mockFormIsValid = true;
    });

    describe('Rendering', () => {
        it('should render modal when open and pdfSection exists', () => {
            renderModal();

            expect(screen.getByTestId('localization-modal')).toBeInTheDocument();
            expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
        });

        it('should not render modal when pdfSection is null', () => {
            renderModal({ pdfSection: null });

            expect(screen.queryByTestId('localization-modal')).not.toBeInTheDocument();
        });

        it('should display modal title', () => {
            renderModal();

            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
        });

        it('should enable translate button when form is valid', () => {
            renderModal();

            const button = screen.getByTestId('save-localization-btn');
            expect(button).toBeEnabled();
        });
    });

    describe('Language Selection', () => {
        it('should select English by default if available', () => {
            renderModal();

            const select = screen.getByTestId('language-select');
            expect(select).toHaveValue('2');
        });

        it('should allow language change', async () => {
            renderModal();
            const user = userEvent.setup();

            const select = screen.getByTestId('language-select');
            await user.selectOptions(select, '1');

            expect(select).toHaveValue('1');
        });
    });

    describe('Form Submission', () => {
        it('should submit translation and call onTranslatePdfSection', async () => {
            const onTranslatePdfSection = jest.fn();
            const onClose = jest.fn();

            mockTranslatePdfSection.mockImplementation(async () => {
                const hookCall = mockUseTranslatePdfSection.mock.calls[0][0];
                hookCall.onSuccess({ ...TEST_DATA.pdfSection });
            });

            renderModal({ onTranslatePdfSection, onClose });

            const button = screen.getByTestId('save-localization-btn');
            fireEvent.click(button);

            await waitFor(() => {
                expect(mockTranslatePdfSection).toHaveBeenCalledWith(TEST_DATA.translatedData);
            });

            expect(onTranslatePdfSection).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalled();
        });

        it('should disable button while submitting', () => {
            mockHookReturn({ isSubmitting: true });

            renderModal();

            const button = screen.getByTestId('save-localization-btn');
            expect(button).toBeDisabled();
        });

        it('should disable language selector while submitting', () => {
            mockHookReturn({ isSubmitting: true });

            renderModal();

            const select = screen.getByTestId('language-select');
            expect(select).toBeDisabled();
        });
    });

    describe('Modal Closure', () => {
        it('should close modal when onClose is called', () => {
            const onClose = jest.fn();
            renderModal({ onClose });

            fireEvent.click(screen.getByTestId('localization-modal'));

            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('Edit Mode', () => {
        it('should render modal in edit mode with existing localization', () => {
            const pdfSectionWithLocalization = {
                ...TEST_DATA.pdfSection,
                localizations: [
                    {
                        languageId: 2,
                        title: 'Existing Translation',
                        description: 'Existing Description',
                        translationStatus: 1,
                        localizationInfoDto: {} as any,
                    } as PdfSectionLocalizationDto,
                ],
            };

            renderModal({ pdfSection: pdfSectionWithLocalization });

            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
            expect(screen.getByTestId('translate-form')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should display error message when API call fails', () => {
            mockHookReturn({ error: 'Failed to translate' });
            renderModal();
            expect(screen.getByText('Failed to translate')).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should disable save button when form is invalid', () => {
            mockFormIsValid = false;

            renderModal();

            expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
        });
    });

    describe('checkIsDirty', () => {
        it('should return true when form is dirty', () => {
            renderModal();

            fireEvent.click(screen.getByTestId('check-dirty-btn'));
            expect(capturedCheckIsDirty?.()).toBe(true);
        });
    });
});
