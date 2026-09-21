import '@/utils/test-mocks/feedback-review-modal-mocks-setup';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddFeedbackReviewModal } from './AddFeedbackReviewModal';
import { FEEDBACK_REVIEW_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { executeCancelCofirmationFlow, executeConfirmCloseFlow } from '@/utils/test-mocks/events-modals-mocks';
import { getAuthorNameInput, getPublishButton, getTextInput } from '@/utils/test-mocks/feedback-review-form-mocks';

describe('AddFeedbackReviewModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
    };

    const fillValidValues = () => {
        fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });
        fireEvent.change(getTextInput(), { target: { value: 'Дуже вдячна центру за підтримку' } });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('elements rendering', () => {
        it('renders modal title', () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            expect(screen.getByTestId('modal-title')).toHaveTextContent(FEEDBACK_TEXT.ADD_REVIEW_MODAL.TITLE);
        });

        it('renders both fields empty', () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            expect(getAuthorNameInput()).toHaveValue('');
            expect(getTextInput()).toHaveValue('');
        });

        it('renders publish button disabled initially', () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            expect(getPublishButton()).toBeDisabled();
        });

        it('does not render modal content when closed', () => {
            render(<AddFeedbackReviewModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('validation', () => {
        it('shows required error for author name on blur when empty', async () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            fireEvent.change(getAuthorNameInput(), { target: { value: '' } });
            fireEvent.blur(getAuthorNameInput());

            await waitFor(() => {
                expect(screen.getByTestId('author-name-error')).toHaveTextContent(
                    FEEDBACK_REVIEW_VALIDATION.authorName.getRequiredError(),
                );
            });
        });

        it('shows min length error for author name on blur', async () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            fireEvent.change(getAuthorNameInput(), { target: { value: 'А' } });
            fireEvent.blur(getAuthorNameInput());

            await waitFor(() => {
                expect(screen.getByTestId('author-name-error')).toHaveTextContent(
                    FEEDBACK_REVIEW_VALIDATION.authorName.getMinError(),
                );
            });
        });

        it('shows min length error for review text on blur', async () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            fireEvent.change(getTextInput(), { target: { value: 'Коротко' } });
            fireEvent.blur(getTextInput());

            await waitFor(() => {
                expect(screen.getByTestId('text-error')).toHaveTextContent(
                    FEEDBACK_REVIEW_VALIDATION.text.getMinError(),
                );
            });
        });

        it('treats a value of only spaces as empty', async () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            fireEvent.change(getAuthorNameInput(), { target: { value: '   ' } });
            fireEvent.blur(getAuthorNameInput());

            await waitFor(() => {
                expect(screen.getByTestId('author-name-error')).toHaveTextContent(
                    FEEDBACK_REVIEW_VALIDATION.authorName.getRequiredError(),
                );
            });
        });
    });

    describe('publish button state', () => {
        it('enables the button when both fields are valid', async () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            fillValidValues();

            await waitFor(() => {
                expect(getPublishButton()).toBeEnabled();
            });
        });

        it('disables the button again when a field becomes invalid', async () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            fillValidValues();

            await waitFor(() => {
                expect(getPublishButton()).toBeEnabled();
            });

            fireEvent.change(getAuthorNameInput(), { target: { value: 'А' } });

            await waitFor(() => {
                expect(getPublishButton()).toBeDisabled();
            });
        });
    });

    describe('close behavior', () => {
        it('calls onClose immediately when form is not dirty', () => {
            const onClose = jest.fn();

            render(<AddFeedbackReviewModal {...defaultProps} onClose={onClose} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('shows confirmation modal when form has unsaved changes', () => {
            render(<AddFeedbackReviewModal {...defaultProps} />);

            fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });
            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        it('does not close the modal when confirmation is cancelled', () => {
            const onClose = jest.fn();

            render(<AddFeedbackReviewModal {...defaultProps} onClose={onClose} />);

            fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });

            executeCancelCofirmationFlow(onClose);
        });

        it('closes the modal when unsaved changes are confirmed', () => {
            const onClose = jest.fn();

            render(<AddFeedbackReviewModal {...defaultProps} onClose={onClose} />);

            fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });

            executeConfirmCloseFlow(onClose);
        });
    });
});
