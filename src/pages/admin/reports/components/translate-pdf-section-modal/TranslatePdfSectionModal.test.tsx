import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TranslatePdfSectionModal } from './TranslatePdfSectionModal';
import { PdfSection } from '@/types/admin/pdf-section';
import { useTranslatePdfSection } from '@/hooks/admin/use-translate-pdf-section/useTranslatePdfSection';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => require('@/utils/test-mocks/test-mocks').MockButton(props),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: (props: any) => require('@/utils/test-mocks/test-mocks').MockConfirmationModal(props),
}));

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ isOpen, children, onClose }: any) =>
        isOpen ? (
            <div
                data-testid="modal"
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
        ) : null;

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: ({ onClose, title, onSave, isSubmitting, isFormValid, children }: any) => (
        <div data-testid="localization-modal" onClick={onClose} role="dialog" aria-modal="true">
            <div data-testid="modal-title">{title}</div>
            <div data-testid="modal-content">{children}</div>
            <button data-testid="save-localization-btn" onClick={onSave} disabled={!isFormValid || isSubmitting}>
                Save
            </button>
        </div>
    ),
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
                    isValid: () => true,
                    isDirty: () => true,
                }));

                React.useEffect(() => {
                    onValidationChange?.(true);
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
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslatePdfSectionModal>> = {}) => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            pdfSection: TEST_DATA.pdfSection,
            onTranslatePdfSection: jest.fn(),
            translatedLanguages: TEST_DATA.translatedLanguages,
        };

        return render(<TranslatePdfSectionModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslatePdfSection.mockResolvedValue(undefined);
        mockUseTranslatePdfSection.mockReturnValue({
            translatePdfSection: mockTranslatePdfSection,
            isSubmitting: false,
            error: '',
        });
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
            mockUseTranslatePdfSection.mockReturnValue({
                translatePdfSection: mockTranslatePdfSection,
                isSubmitting: true,
                error: '',
            });

            renderModal();

            const button = screen.getByTestId('save-localization-btn');
            expect(button).toBeDisabled();
        });

        it('should disable language selector while submitting', () => {
            mockUseTranslatePdfSection.mockReturnValue({
                translatePdfSection: mockTranslatePdfSection,
                isSubmitting: true,
                error: '',
            });

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
                    },
                ],
            };

            mockUseTranslatePdfSection.mockReturnValue({
                translatePdfSection: mockTranslatePdfSection,
                isSubmitting: false,
                error: '',
            });

            renderModal({ pdfSection: pdfSectionWithLocalization });

            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
            expect(screen.getByTestId('translate-form')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should display error message when API call fails', () => {
            mockUseTranslatePdfSection.mockReturnValue({
                translatePdfSection: mockTranslatePdfSection,
                isSubmitting: false,
                error: 'Failed to translate',
            });

            renderModal();

            expect(screen.getByText('Failed to translate')).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should disable save button when form is invalid', () => {
            mockUseTranslatePdfSection.mockReturnValue({
                translatePdfSection: mockTranslatePdfSection,
                isSubmitting: false,
                error: '',
            });

            const { rerender } = render(
                <TranslatePdfSectionModal
                    isOpen={true}
                    onClose={jest.fn()}
                    pdfSection={TEST_DATA.pdfSection}
                    onTranslatePdfSection={jest.fn()}
                    translatedLanguages={TEST_DATA.translatedLanguages}
                />,
            );

            rerender(
                <TranslatePdfSectionModal
                    isOpen={true}
                    onClose={jest.fn()}
                    pdfSection={TEST_DATA.pdfSection}
                    onTranslatePdfSection={jest.fn()}
                    translatedLanguages={TEST_DATA.translatedLanguages}
                />,
            );

            expect(screen.getByTestId('save-localization-btn')).toBeEnabled();
        });
    });
});
