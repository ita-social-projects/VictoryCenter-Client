import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { VisibilityStatus, ModalMode } from '@/types/admin/common';
import { FaqQuestion, VisitorPage } from '@/types/admin/faq';
import { FaqModal, FaqModalProps } from './FaqModal';
import { FAQ_TEXT } from '@/const/admin/faq';
import { FaqApi } from '@/services/api/admin/faq/faq-api';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn().mockReturnValue({
        // Add any properties the client should have
        defaults: { headers: { common: {} } },
    }),
}));

jest.mock('@/services/api/admin/faq/faq-api', () => {
    return {
        FaqApi: {
            post: jest.fn(),
            update: jest.fn(),
        },
    };
});

const mockFaqApi = FaqApi as jest.Mocked<typeof FaqApi>;

const mockFormRef = {
    submit: jest.fn(),
    isDirty: jest.fn(() => false),
    isValid: jest.fn(() => true),
};

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({
        title,
        isOpen,
        onConfirm,
        onCancel,
    }: {
        title: string;
        isOpen: boolean;
        onConfirm: () => void;
        onCancel: () => void;
    }) =>
        isOpen ? (
            <div data-testid="question-modal">
                <h3 data-testid="question-title">{title}</h3>
                <button data-testid="question-confirm" onClick={onConfirm}>
                    Confirm
                </button>
                <button data-testid="question-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        ) : null,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({
        onClick,
        disabled,
        children,
        buttonStyle,
    }: {
        onClick?: () => void;
        disabled?: boolean;
        children: React.ReactNode;
        buttonStyle?: string;
    }) => (
        <button
            disabled={disabled}
            onClick={onClick}
            data-testid={buttonStyle === 'secondary' ? 'draft-button' : 'publish-button'}
        >
            {children}
        </button>
    ),
}));

jest.mock('@/components/common/modal/Modal', () => {
    const MockModal = ({
        onClose,
        children,
        isOpen,
    }: {
        onClose: () => void;
        children: React.ReactNode;
        isOpen: boolean;
    }) => {
        return isOpen ? (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        ) : null;
    };
    MockModal.Title = ({ children }: { children: React.ReactNode }) => <h1 data-testid="modal-title">{children}</h1>;
    MockModal.Content = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-content">{children}</div>
    );
    MockModal.Actions = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-actions">{children}</div>
    );
    return { Modal: MockModal };
});

let capturedFormProps: any = {};
jest.mock('../../faq-form/FaqForm', () => {
    const React = require('react');
    const MockFaqForm = React.forwardRef((props: any, ref: any) => {
        capturedFormProps = props;
        React.useImperativeHandle(ref, () => mockFormRef);

        return <div data-testid="faq-form" />;
    });
    return { FaqForm: MockFaqForm };
});

const mockPages: VisitorPage[] = [
    { id: 1, title: 'Page 1', slug: 'page-1' },
    { id: 2, title: 'Page 2', slug: 'page-2' },
];

const mockFaq: FaqQuestion = {
    id: 1,
    questionText: 'Test Question',
    answerText: 'Test Answer',
    pages: [mockPages[0]],
    status: VisibilityStatus.Draft,
};

const mockFormData = {
    questionText: 'Test Question',
    answerText: 'Test Answer',
    pages: [mockPages[0]],
};

describe('FaqModal', () => {
    const mockOnClose = jest.fn();
    const mockOnAddFaq = jest.fn();
    const mockOnEditFaq = jest.fn();

    const baseProps = {
        isOpen: true,
        onClose: mockOnClose,
        pages: mockPages,
    };

    const addModeProps: FaqModalProps = {
        ...baseProps,
        mode: ModalMode.Add,
        onAddFaq: mockOnAddFaq,
    };

    const editModeProps: FaqModalProps = {
        ...baseProps,
        mode: ModalMode.Edit,
        faqToEdit: mockFaq,
        onEditFaq: mockOnEditFaq,
    };

    const getModal = () => screen.queryByTestId('modal');
    const getDraftButton = () => screen.getByTestId('draft-button');
    const getPublishButton = () => screen.getByTestId('publish-button');
    const getQuestionModal = () => screen.queryByTestId('question-modal');
    const getQuestionTitle = () => screen.getByTestId('question-title');
    const getQuestionConfirmButton = () => screen.getByTestId('question-confirm');
    const getQuestionCancelButton = () => screen.getByTestId('question-cancel');
    const getModalCloseButton = () => screen.getByTestId('modal-close');
    const getCreateErrorContainer = () => screen.queryByText(FAQ_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_FAQ);
    const getUpdateErrorContainer = () => screen.queryByText(FAQ_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_FAQ);

    const simulateFormBecomesValid = () => {
        act(() => {
            capturedFormProps.onValidationChange(true);
        });
    };

    const simulateFormSubmit = (status: VisibilityStatus) => {
        act(() => {
            capturedFormProps.onSubmit(mockFormData, status);
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormRef.isDirty.mockReturnValue(false);
        mockFormRef.isValid.mockReturnValue(true);
        mockFaqApi.post.mockResolvedValue({
            ...mockFaq,
            ...mockFormData,
            pageIds: mockFormData.pages.map((p) => p.id),
        });
        mockFaqApi.update.mockResolvedValue({
            ...mockFaq,
            ...mockFormData,
            pageIds: mockFormData.pages.map((p) => p.id),
        });
    });

    describe('General rendering and closing behavior', () => {
        it('should not render the modal when isOpen is false', () => {
            render(<FaqModal {...addModeProps} isOpen={false} />);
            expect(getModal()).not.toBeInTheDocument();
        });

        it('should call onClose when the close button is clicked and form is not dirty', () => {
            render(<FaqModal {...addModeProps} />);
            fireEvent.click(getModalCloseButton());
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should show a confirmation modal when closing with a dirty form', () => {
            mockFormRef.isDirty.mockReturnValue(true);
            render(<FaqModal {...addModeProps} />);

            fireEvent.click(getModalCloseButton());

            expect(mockOnClose).not.toHaveBeenCalled();
            expect(getQuestionModal()).toBeInTheDocument();
            expect(getQuestionTitle()).toHaveTextContent(
                COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE,
            );
        });

        it('should close the modal after confirming to discard changes', () => {
            mockFormRef.isDirty.mockReturnValue(true);
            render(<FaqModal {...addModeProps} />);
            fireEvent.click(getModalCloseButton()); // Open confirmation

            fireEvent.click(getQuestionConfirmButton()); // Click "Yes"
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should not close the modal after canceling the discard changes confirmation', () => {
            mockFormRef.isDirty.mockReturnValue(true);
            render(<FaqModal {...addModeProps} />);
            fireEvent.click(getModalCloseButton()); // Open confirmation

            fireEvent.click(getQuestionCancelButton()); // Click "No"
            expect(mockOnClose).not.toHaveBeenCalled();
            expect(getQuestionModal()).not.toBeInTheDocument();
        });

        it('should start with disabled buttons and enable them when form is valid', () => {
            render(<FaqModal {...addModeProps} />);
            // Buttons are initially disabled because the form hasn't reported its validity
            expect(getDraftButton()).toBeDisabled();
            expect(getPublishButton()).toBeDisabled();

            // Simulate the form becoming valid
            simulateFormBecomesValid();

            // Buttons should now be enabled
            expect(getDraftButton()).not.toBeDisabled();
            expect(getPublishButton()).not.toBeDisabled();
        });
    });

    describe('Add Mode', () => {
        it('should render with the correct "Add FAQ" title', () => {
            render(<FaqModal {...addModeProps} />);
            expect(screen.getByTestId('modal-title')).toHaveTextContent(FAQ_TEXT.FORM.TITLE.ADD_FAQ);
        });

        it('should successfully add a program as a draft', async () => {
            render(<FaqModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getDraftButton());
            expect(mockFormRef.submit).toHaveBeenCalledWith(VisibilityStatus.Draft);

            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(FAQ_TEXT.QUESTION.DRAFT_FAQ);

            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockFaqApi.post).toHaveBeenCalled();
                const call = mockFaqApi.post.mock.calls[0];
                expect(call[1].status).toBe(VisibilityStatus.Draft);
            });
            expect(mockOnAddFaq).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should successfully add a FAQ as published', async () => {
            render(<FaqModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            expect(mockFormRef.submit).toHaveBeenCalledWith(VisibilityStatus.Published);

            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(FAQ_TEXT.QUESTION.PUBLISH_FAQ);

            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockFaqApi.post).toHaveBeenCalled();
                const call = mockFaqApi.post.mock.calls[0];
                expect(call[1].status).toBe(VisibilityStatus.Published);
            });
            expect(mockOnAddFaq).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should show an error message if adding a FAQ fails', async () => {
            mockFaqApi.post.mockRejectedValue(new Error('API Error'));
            render(<FaqModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);
            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(getCreateErrorContainer()).toBeInTheDocument();
            });
            expect(mockOnAddFaq).not.toHaveBeenCalled();
            expect(mockOnClose).not.toHaveBeenCalled();
            expect(getPublishButton()).not.toBeDisabled();
        });

        it('should cancel the submission and not call the API', async () => {
            render(<FaqModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            fireEvent.click(getQuestionCancelButton());

            expect(getQuestionModal()).not.toBeInTheDocument();
            expect(mockFaqApi.post).not.toHaveBeenCalled();
            expect(mockOnAddFaq).not.toHaveBeenCalled();
        });
    });

    // --- Edit Mode ---
    describe('Edit Mode', () => {
        it('should render with the correct "Edit FAQ" title', () => {
            render(<FaqModal {...editModeProps} />);
            expect(screen.getByTestId('modal-title')).toHaveTextContent(FAQ_TEXT.FORM.TITLE.EDIT_FAQ);
        });

        it('should successfully save changes to a draft FAQ', async () => {
            render(<FaqModal {...editModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getDraftButton());
            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES);
            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockFaqApi.update).toHaveBeenCalled();
                const call = mockFaqApi.update.mock.calls[0];
                expect(call[1].id).toBe(mockFaq.id);
                expect(call[1].status).toBe(VisibilityStatus.Draft);
            });
            expect(mockOnEditFaq).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should show correct confirmation title when publishing a draft FAQ', async () => {
            render(<FaqModal {...editModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(FAQ_TEXT.QUESTION.PUBLISH_FAQ);
        });

        it('should show correct confirmation title when saving changes to a published FAQ', async () => {
            const publishedFAQ = { ...mockFaq, status: VisibilityStatus.Published };
            render(<FaqModal {...editModeProps} faqToEdit={publishedFAQ} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES);
        });

        it('should show correct confirmation title when un-publishing a FAQ', async () => {
            const publishedFAQ = { ...mockFaq, status: VisibilityStatus.Published };
            render(<FaqModal {...editModeProps} faqToEdit={publishedFAQ} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getDraftButton());
            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION);
        });

        it('should show an error message if editing a FAQ fails', async () => {
            mockFaqApi.update.mockRejectedValue(new Error('API Error'));
            render(<FaqModal {...editModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);
            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(getUpdateErrorContainer()).toBeInTheDocument();
            });
            expect(mockOnEditFaq).not.toHaveBeenCalled();
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });
});
