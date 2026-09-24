import '@/utils/test-mocks/feedback-review-modal-mocks-setup';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddFeedbackReviewModal } from './AddFeedbackReviewModal';
import { FEEDBACK_REVIEW_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { VisibilityStatus } from '@/types/admin/common';
import { FeedbackReviewDto } from '@/types/admin/feedback';
import { executeCancelCofirmationFlow, executeConfirmCloseFlow } from '@/utils/test-mocks/events-modals-mocks';
import { getAuthorNameInput, getPublishButton, getTextInput } from '@/utils/test-mocks/feedback-review-form-mocks';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

jest.mock('@/services/api/admin/feedback/feedback-api', () => ({
    FeedbackApi: {
        updateReview: jest.fn(),
    },
}));

describe('AddFeedbackReviewModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('add mode', () => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
        };

        const fillValidValues = () => {
            fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });
            fireEvent.change(getTextInput(), { target: { value: 'Дуже вдячна центру за підтримку' } });
        };

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

    describe('edit mode', () => {
        const mockReview: FeedbackReviewDto = {
            id: 5,
            authorName: 'Анастасія',
            text: 'Дуже вдячна центру за підтримку',
            status: VisibilityStatus.Published,
            priority: 1,
        };

        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            initialData: mockReview,
            onEditReview: jest.fn(),
            onEditError: jest.fn(),
        };

        const renderAndWaitForPrefill = async (props = {}) => {
            render(<AddFeedbackReviewModal {...defaultProps} {...props} />);

            await waitFor(() => {
                expect(getAuthorNameInput()).toHaveValue(mockReview.authorName);
            });
        };

        const changeAndClickPublish = async () => {
            fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });

            await waitFor(() => {
                expect(getPublishButton()).toBeEnabled();
            });

            fireEvent.click(getPublishButton());
        };

        describe('elements rendering', () => {
            it('renders edit modal title', async () => {
                await renderAndWaitForPrefill();

                expect(screen.getByTestId('modal-title')).toHaveTextContent(FEEDBACK_TEXT.EDIT_REVIEW_MODAL.TITLE);
            });

            it('pre-populates fields with the review data', async () => {
                await renderAndWaitForPrefill();

                expect(getAuthorNameInput()).toHaveValue(mockReview.authorName);
                expect(getTextInput()).toHaveValue(mockReview.text);
            });

            it('renders publish button disabled initially', async () => {
                await renderAndWaitForPrefill();

                expect(getPublishButton()).toBeDisabled();
            });
        });

        describe('publish button state', () => {
            it('enables the button when a value is changed and valid', async () => {
                await renderAndWaitForPrefill();

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });

                await waitFor(() => {
                    expect(getPublishButton()).toBeEnabled();
                });
            });

            it('disables the button again when the value is changed back to the original', async () => {
                await renderAndWaitForPrefill();

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });

                await waitFor(() => {
                    expect(getPublishButton()).toBeEnabled();
                });

                fireEvent.change(getAuthorNameInput(), { target: { value: mockReview.authorName } });

                await waitFor(() => {
                    expect(getPublishButton()).toBeDisabled();
                });
            });

            it('keeps the button disabled when a changed value is invalid', async () => {
                await renderAndWaitForPrefill();

                fireEvent.change(getAuthorNameInput(), { target: { value: 'А' } });
                fireEvent.blur(getAuthorNameInput());

                await waitFor(() => {
                    expect(getPublishButton()).toBeDisabled();
                });
            });
        });

        describe('publish flow', () => {
            it('shows publish confirmation when publish is clicked', async () => {
                await renderAndWaitForPrefill();
                await changeAndClickPublish();

                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
                expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();
            });

            it('does not save and keeps the modal open when publish is cancelled', async () => {
                await renderAndWaitForPrefill();
                await changeAndClickPublish();

                fireEvent.click(screen.getByTestId('confirmation-cancel'));

                expect(FeedbackApi.updateReview).not.toHaveBeenCalled();
                expect(defaultProps.onClose).not.toHaveBeenCalled();
                expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
                expect(getAuthorNameInput()).toHaveValue('Олена');
            });

            it('saves changes, notifies parent and closes when publish is confirmed', async () => {
                const updatedReview = { ...mockReview, authorName: 'Олена' };
                (FeedbackApi.updateReview as jest.Mock).mockResolvedValue(updatedReview);

                await renderAndWaitForPrefill();
                await changeAndClickPublish();

                fireEvent.click(screen.getByTestId('confirmation-confirm'));

                await waitFor(() => {
                    expect(FeedbackApi.updateReview).toHaveBeenCalledWith(expect.anything(), mockReview.id, {
                        authorName: 'Олена',
                        text: mockReview.text,
                        status: mockReview.status,
                    });
                    expect(defaultProps.onEditReview).toHaveBeenCalledWith(updatedReview);
                    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
                });
            });

            it('calls onEditError and keeps the modal open when saving fails', async () => {
                (FeedbackApi.updateReview as jest.Mock).mockRejectedValue(new Error('Update failed'));

                await renderAndWaitForPrefill();
                await changeAndClickPublish();

                fireEvent.click(screen.getByTestId('confirmation-confirm'));

                await waitFor(() => {
                    expect(defaultProps.onEditError).toHaveBeenCalledTimes(1);
                });

                expect(defaultProps.onEditReview).not.toHaveBeenCalled();
                expect(defaultProps.onClose).not.toHaveBeenCalled();
            });
        });

        describe('close behavior', () => {
            it('calls onClose immediately when nothing was changed', async () => {
                const onClose = jest.fn();

                await renderAndWaitForPrefill({ onClose });

                fireEvent.click(screen.getByTestId('modal-close'));

                expect(onClose).toHaveBeenCalledTimes(1);
                expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
            });

            it('shows confirmation when closing with unsaved changes', async () => {
                await renderAndWaitForPrefill();

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });
                fireEvent.click(screen.getByTestId('modal-close'));

                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });

            it('does not close the modal when close confirmation is cancelled', async () => {
                const onClose = jest.fn();

                await renderAndWaitForPrefill({ onClose });

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });

                executeCancelCofirmationFlow(onClose);
            });

            it('closes the modal when unsaved changes are confirmed', async () => {
                const onClose = jest.fn();

                await renderAndWaitForPrefill({ onClose });

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });

                executeConfirmCloseFlow(onClose);
            });
        });
    });
});
