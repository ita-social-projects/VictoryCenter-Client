import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateFaqModal } from './TranslateFaqModal';
import { FaqQuestion } from '@/types/admin/faq';
import { useTranslateFaq } from '@/hooks/admin/use-translate-faq/useTranslateFaq';
import { ModalMode } from '@/types/admin/common';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => (
        <button {...props} data-testid={props['data-testid'] || 'button'}>
            {props.children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <button data-testid="confirm-close" onClick={onConfirm}>
                    confirm
                </button>
                <button data-testid="cancel-close" onClick={onCancel}>
                    cancel
                </button>
            </div>
        ) : null,
}));

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => {
    const React = require('react');

    return {
        LocalizationModal: ({
            isOpen,
            children,
            onClose,
            onSave,
            isSubmitting,
            isFormValid,
            checkIsDirty,
            title,
        }: any) => {
            const [showConfirmation, setShowConfirmation] = React.useState(false);

            if (!isOpen) return null;

            const handleClose = () => {
                if (checkIsDirty && checkIsDirty()) {
                    setShowConfirmation(true);
                } else {
                    onClose();
                }
            };

            const handleConfirmClose = () => {
                setShowConfirmation(false);
                onClose();
            };

            const handleCancelClose = () => {
                setShowConfirmation(false);
            };

            return (
                <>
                    <div
                        data-testid="modal"
                        onClick={handleClose}
                        role="dialog"
                        aria-modal="true"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') handleClose();
                        }}
                    >
                        <div data-testid="modal-title">{title}</div>
                        <div data-testid="modal-content">{children}</div>
                        <div data-testid="modal-actions">
                            <button
                                data-testid="save-localization-btn"
                                onClick={onSave}
                                disabled={isSubmitting || !isFormValid}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                    {showConfirmation && (
                        <div data-testid="confirmation-modal">
                            <button data-testid="confirm-close" onClick={handleConfirmClose}>
                                confirm
                            </button>
                            <button data-testid="cancel-close" onClick={handleCancelClose}>
                                cancel
                            </button>
                        </div>
                    )}
                </>
            );
        },
    };
});

jest.mock('./TranslateFaqForm', () => {
    const React = require('react');

    return {
        TranslateFaqForm: React.forwardRef(({ onSubmit, onValidationChange }: any, ref: React.Ref<any>) => {
            React.useImperativeHandle(ref, () => ({
                submit: () =>
                    onSubmit({
                        question: 'Translated Question',
                        answer: 'Translated Answer',
                    }),
                isValid: () => true,
                isDirty: () => true,
            }));

            React.useEffect(() => {
                onValidationChange?.(true);
            }, [onValidationChange]);

            return <div data-testid="translate-form" />;
        }),
    };
});

const mockTranslateFaq = jest.fn();
jest.mock('@/hooks/admin/use-translate-faq/useTranslateFaq', () => ({
    useTranslateFaq: jest.fn(() => ({
        translateFaq: mockTranslateFaq,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateFaq = jest.mocked(useTranslateFaq);

const TEST_DATA = {
    faq: {
        id: 1,
        questionText: 'Original Question',
        answerText: 'Original Answer',
        status: 1 as any,
        pages: [],
        localizations: [],
    } as FaqQuestion,
    faqWithLocalization: {
        id: 1,
        questionText: 'Original Question',
        answerText: 'Original Answer',
        status: 1 as any,
        pages: [],
        localizations: [
            {
                questionText: 'Existing Question',
                answerText: 'Existing Answer',
                language: {
                    id: 2,
                    code: 'en',
                },
                translationStatus: 1,
            },
        ],
    } as FaqQuestion,
    language: {
        id: 2,
        code: 'en',
        name: 'English',
    },
    translatedData: {
        question: 'Translated Question',
        answer: 'Translated Answer',
    },
};

describe('TranslateFaqModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateFaqModal>> = {}) => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            faqToTranslate: TEST_DATA.faq,
            onTranslateFaq: jest.fn(),
            language: TEST_DATA.language,
        };

        return render(<TranslateFaqModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslateFaq.mockResolvedValue(undefined);
        mockUseTranslateFaq.mockReturnValue({
            translateFaq: mockTranslateFaq,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('renders modal when open and faq exists', () => {
        renderModal();

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
    });

    it('does not render modal when faqToTranslate is null', () => {
        renderModal({ faqToTranslate: null });

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('enables translate button when form is valid', () => {
        renderModal();

        const button = screen.getByTestId('save-localization-btn');
        expect(button).toBeEnabled();
    });

    it('submits translation and calls translateFaq', async () => {
        const onTranslateFaq = jest.fn();
        const onClose = jest.fn();

        mockTranslateFaq.mockImplementation(async () => {
            const hookCall = mockUseTranslateFaq.mock.calls[0][0];
            hookCall.onSuccess({ ...TEST_DATA.faq });
        });

        renderModal({ onTranslateFaq, onClose });

        const button = screen.getByTestId('save-localization-btn');
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockTranslateFaq).toHaveBeenCalledWith(TEST_DATA.translatedData);
        });

        expect(onTranslateFaq).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalled();
    });

    it('shows confirmation modal on close when form is dirty', () => {
        const onClose = jest.fn();

        renderModal({ onClose });

        fireEvent.click(screen.getByTestId('modal'));

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('disables translate button while submitting', () => {
        mockUseTranslateFaq.mockReturnValue({
            translateFaq: mockTranslateFaq,
            isSubmitting: true,
            error: '',
            clearError: jest.fn(),
        });

        renderModal();

        const button = screen.getByTestId('save-localization-btn');
        expect(button).toBeDisabled();
    });

    it('displays error message when error exists', () => {
        mockUseTranslateFaq.mockReturnValue({
            translateFaq: mockTranslateFaq,
            isSubmitting: false,
            error: 'Translation failed',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByText('Translation failed')).toBeInTheDocument();
    });

    it('determines edit mode when localization exists', () => {
        renderModal({ faqToTranslate: TEST_DATA.faqWithLocalization });

        expect(mockUseTranslateFaq).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: ModalMode.Edit,
            }),
        );
    });

    it('determines add mode when no localization exists', () => {
        renderModal();

        expect(mockUseTranslateFaq).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: ModalMode.Add,
            }),
        );
    });
});
