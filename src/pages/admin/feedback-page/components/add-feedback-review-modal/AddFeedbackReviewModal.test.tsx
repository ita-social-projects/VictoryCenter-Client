import { fireEvent, getDefaultNormalizer, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddFeedbackReviewModal, AddFeedbackReviewModalProps } from './AddFeedbackReviewModal';
import { FEEDBACK_REVIEW_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackReviewDto } from '@/types/admin/feedback';

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal');

const getAuthorNameInput = () =>
    screen.getByRole('textbox', { name: new RegExp(FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.AUTHOR_NAME) });
const getTextInput = () => screen.getByRole('textbox', { name: new RegExp(FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.TEXT) });
const getPublishButton = () => screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
const getCloseButton = () => screen.getByRole('button', { name: 'Close modal' });

const createProps = (overrides: Partial<AddFeedbackReviewModalProps> = {}): AddFeedbackReviewModalProps => ({
    mode: ModalMode.Add,
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onSuccess: jest.fn(),
    ...overrides,
});

describe('AddFeedbackReviewModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('add mode', () => {
        const fillValidValues = () => {
            fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });
            fireEvent.change(getTextInput(), { target: { value: 'Дуже вдячна центру за підтримку' } });
        };

        const fillAndClickPublish = async () => {
            fillValidValues();

            await waitFor(() => {
                expect(getPublishButton()).toBeEnabled();
            });

            fireEvent.click(getPublishButton());
            await screen.findByTestId('confirm-modal');
        };

        describe('elements rendering', () => {
            it('renders modal title', () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                expect(screen.getByText(FEEDBACK_TEXT.ADD_REVIEW_MODAL.TITLE)).toBeInTheDocument();
            });

            it('renders both fields empty', () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                expect(getAuthorNameInput()).toHaveValue('');
                expect(getTextInput()).toHaveValue('');
            });

            it('renders publish button disabled initially', () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                expect(getPublishButton()).toBeDisabled();
            });

            it('does not render the draft button', () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                expect(
                    screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT }),
                ).not.toBeInTheDocument();
            });

            it('does not render modal content when closed', () => {
                render(<AddFeedbackReviewModal {...createProps({ isOpen: false })} />);

                expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
            });
        });

        describe('validation', () => {
            it('shows required error for author name on blur when empty', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                fireEvent.blur(getAuthorNameInput());

                expect(
                    await screen.findByText(FEEDBACK_REVIEW_VALIDATION.authorName.getRequiredError()),
                ).toBeInTheDocument();
            });

            it('shows min length error for author name on blur', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                fireEvent.change(getAuthorNameInput(), { target: { value: 'А' } });
                fireEvent.blur(getAuthorNameInput());

                expect(
                    await screen.findByText(FEEDBACK_REVIEW_VALIDATION.authorName.getMinError()),
                ).toBeInTheDocument();
            });

            it('shows min length error for review text on blur', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                fireEvent.change(getTextInput(), { target: { value: 'Коротко' } });
                fireEvent.blur(getTextInput());

                expect(await screen.findByText(FEEDBACK_REVIEW_VALIDATION.text.getMinError())).toBeInTheDocument();
            });

            it('treats a value of only spaces as empty', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                fireEvent.change(getAuthorNameInput(), { target: { value: '   ' } });
                fireEvent.blur(getAuthorNameInput());

                expect(
                    await screen.findByText(FEEDBACK_REVIEW_VALIDATION.authorName.getRequiredError()),
                ).toBeInTheDocument();
            });
        });

        describe('publish button state', () => {
            it('enables the button when both fields are valid', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                fillValidValues();

                await waitFor(() => {
                    expect(getPublishButton()).toBeEnabled();
                });
            });

            it('disables the button again when a field becomes invalid', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

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

        describe('publish flow', () => {
            it('shows publish confirmation with the new-review title', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                await fillAndClickPublish();

                expect(screen.getByText(FEEDBACK_TEXT.PUBLISH_MODAL.TITLE_NEW)).toBeInTheDocument();
            });

            it('does not save and keeps the modal open when publish is cancelled', async () => {
                const props = createProps();
                render(<AddFeedbackReviewModal {...props} />);

                await fillAndClickPublish();

                fireEvent.click(screen.getByTestId('confirm-no'));

                expect(props.onSubmit).not.toHaveBeenCalled();
                expect(props.onClose).not.toHaveBeenCalled();
                expect(getAuthorNameInput()).toHaveValue('Анастасія');
            });

            it('creates the review, notifies parent and closes when publish is confirmed', async () => {
                const newReview: FeedbackReviewDto = {
                    id: 7,
                    authorName: 'Анастасія',
                    text: 'Дуже вдячна центру за підтримку',
                    status: VisibilityStatus.Published,
                    priority: 1,
                    localizations: [],
                };
                const props = createProps({ onSubmit: jest.fn().mockResolvedValue(newReview) });
                render(<AddFeedbackReviewModal {...props} />);

                await fillAndClickPublish();

                fireEvent.click(screen.getByTestId('confirm-yes'));

                await waitFor(() => {
                    expect(props.onSubmit).toHaveBeenCalledWith(
                        {
                            authorName: 'Анастасія',
                            text: 'Дуже вдячна центру за підтримку',
                            status: VisibilityStatus.Published,
                        },
                        undefined,
                    );
                    expect(props.onSuccess).toHaveBeenCalledWith(newReview, ModalMode.Add);
                    expect(props.onClose).toHaveBeenCalledTimes(1);
                });
            });

            it('shows an error and keeps the modal open when creation fails', async () => {
                const props = createProps({ onSubmit: jest.fn().mockRejectedValue(new Error('Create failed')) });
                render(<AddFeedbackReviewModal {...props} />);

                await fillAndClickPublish();

                fireEvent.click(screen.getByTestId('confirm-yes'));

                expect(await screen.findByText(FEEDBACK_TEXT.MESSAGE.FAIL_TO_PUBLISH)).toBeInTheDocument();
                expect(props.onSuccess).not.toHaveBeenCalled();
                expect(props.onClose).not.toHaveBeenCalled();
                expect(getAuthorNameInput()).toHaveValue('Анастасія');
            });
        });

        describe('close behavior', () => {
            it('calls onClose immediately when form is not dirty', () => {
                const props = createProps();
                render(<AddFeedbackReviewModal {...props} />);

                fireEvent.click(getCloseButton());

                expect(props.onClose).toHaveBeenCalledTimes(1);
                expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
            });

            it('shows confirmation modal when form has unsaved changes', async () => {
                render(<AddFeedbackReviewModal {...createProps()} />);

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });
                fireEvent.click(getCloseButton());

                expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();
                expect(
                    screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE, {
                        normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
                    }),
                ).toBeInTheDocument();
            });

            it('does not close the modal when confirmation is cancelled', async () => {
                const props = createProps();
                render(<AddFeedbackReviewModal {...props} />);

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });
                fireEvent.click(getCloseButton());
                fireEvent.click(await screen.findByTestId('confirm-no'));

                expect(props.onClose).not.toHaveBeenCalled();
                expect(getAuthorNameInput()).toHaveValue('Анастасія');
            });

            it('closes the modal when unsaved changes are confirmed', async () => {
                const props = createProps();
                render(<AddFeedbackReviewModal {...props} />);

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Анастасія' } });
                fireEvent.click(getCloseButton());
                fireEvent.click(await screen.findByTestId('confirm-yes'));

                expect(props.onClose).toHaveBeenCalledTimes(1);
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
            localizations: [],
        };

        const createEditProps = (overrides: Partial<AddFeedbackReviewModalProps> = {}) =>
            createProps({ mode: ModalMode.Edit, reviewToEdit: mockReview, ...overrides });

        const renderAndWaitForPrefill = async (props: AddFeedbackReviewModalProps) => {
            render(<AddFeedbackReviewModal {...props} />);

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
            await screen.findByTestId('confirm-modal');
        };

        describe('elements rendering', () => {
            it('renders edit modal title', async () => {
                await renderAndWaitForPrefill(createEditProps());

                expect(screen.getByText(FEEDBACK_TEXT.EDIT_REVIEW_MODAL.TITLE)).toBeInTheDocument();
            });

            it('pre-populates fields with the review data', async () => {
                await renderAndWaitForPrefill(createEditProps());

                expect(getAuthorNameInput()).toHaveValue(mockReview.authorName);
                expect(getTextInput()).toHaveValue(mockReview.text);
            });

            it('renders publish button disabled initially', async () => {
                await renderAndWaitForPrefill(createEditProps());

                expect(getPublishButton()).toBeDisabled();
            });
        });

        describe('publish button state', () => {
            it('enables the button when a value is changed and valid', async () => {
                await renderAndWaitForPrefill(createEditProps());

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });

                await waitFor(() => {
                    expect(getPublishButton()).toBeEnabled();
                });
            });

            it('disables the button again when the value is changed back to the original', async () => {
                await renderAndWaitForPrefill(createEditProps());

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
                await renderAndWaitForPrefill(createEditProps());

                fireEvent.change(getAuthorNameInput(), { target: { value: 'А' } });
                fireEvent.blur(getAuthorNameInput());

                await waitFor(() => {
                    expect(getPublishButton()).toBeDisabled();
                });
            });
        });

        describe('publish flow', () => {
            it('shows publish confirmation when publish is clicked', async () => {
                await renderAndWaitForPrefill(createEditProps());
                await changeAndClickPublish();

                expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();
            });

            it('does not save and keeps the modal open when publish is cancelled', async () => {
                const props = createEditProps();
                await renderAndWaitForPrefill(props);
                await changeAndClickPublish();

                fireEvent.click(screen.getByTestId('confirm-no'));

                expect(props.onSubmit).not.toHaveBeenCalled();
                expect(props.onClose).not.toHaveBeenCalled();
                expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
                expect(getAuthorNameInput()).toHaveValue('Олена');
            });

            it('saves changes, notifies parent and closes when publish is confirmed', async () => {
                const updatedReview = { ...mockReview, authorName: 'Олена' };
                const props = createEditProps({ onSubmit: jest.fn().mockResolvedValue(updatedReview) });
                await renderAndWaitForPrefill(props);
                await changeAndClickPublish();

                fireEvent.click(screen.getByTestId('confirm-yes'));

                await waitFor(() => {
                    expect(props.onSubmit).toHaveBeenCalledWith(
                        { authorName: 'Олена', text: mockReview.text, status: VisibilityStatus.Published },
                        mockReview,
                    );
                    expect(props.onSuccess).toHaveBeenCalledWith(updatedReview, ModalMode.Edit);
                    expect(props.onClose).toHaveBeenCalledTimes(1);
                });
            });

            it('shows an error and keeps the modal open when saving fails', async () => {
                const props = createEditProps({ onSubmit: jest.fn().mockRejectedValue(new Error('Update failed')) });
                await renderAndWaitForPrefill(props);
                await changeAndClickPublish();

                fireEvent.click(screen.getByTestId('confirm-yes'));

                expect(await screen.findByText(FEEDBACK_TEXT.MESSAGE.FAIL_TO_UPDATE)).toBeInTheDocument();
                expect(props.onSuccess).not.toHaveBeenCalled();
                expect(props.onClose).not.toHaveBeenCalled();
            });
        });

        describe('close behavior', () => {
            it('calls onClose immediately when nothing was changed', async () => {
                const props = createEditProps();
                await renderAndWaitForPrefill(props);

                fireEvent.click(getCloseButton());

                expect(props.onClose).toHaveBeenCalledTimes(1);
                expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
            });

            it('shows confirmation when closing with unsaved changes', async () => {
                await renderAndWaitForPrefill(createEditProps());

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });
                fireEvent.click(getCloseButton());

                expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();
            });

            it('does not close the modal when close confirmation is cancelled', async () => {
                const props = createEditProps();
                await renderAndWaitForPrefill(props);

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });
                fireEvent.click(getCloseButton());
                fireEvent.click(await screen.findByTestId('confirm-no'));

                expect(props.onClose).not.toHaveBeenCalled();
                expect(getAuthorNameInput()).toHaveValue('Олена');
            });

            it('closes the modal when unsaved changes are confirmed', async () => {
                const props = createEditProps();
                await renderAndWaitForPrefill(props);

                fireEvent.change(getAuthorNameInput(), { target: { value: 'Олена' } });
                fireEvent.click(getCloseButton());
                fireEvent.click(await screen.findByTestId('confirm-yes'));

                expect(props.onClose).toHaveBeenCalledTimes(1);
            });
        });
    });
});
