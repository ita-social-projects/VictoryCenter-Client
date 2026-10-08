import { render, screen, fireEvent, waitFor, act, getDefaultNormalizer } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT, VIDEO_REVIEW_VALIDATION } from '@/const/admin/feedback';
import { FeedbackVideoDto } from '@/types/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { AddVideoReviewModal, AddVideoReviewModalProps } from './AddVideoReviewModal';

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal');

describe('AddVideoReviewModal', () => {
    const SUBMIT_BUTTON_NAME = COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED;
    const validTitle = 'A valid video review title';
    const validLink = 'https://example.com/video';

    const mockInitialData: FeedbackVideoDto = {
        id: 5,
        title: 'Existing title',
        link: 'https://example.com/existing',
        status: VisibilityStatus.Published,
        priority: 1,
        localizations: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderOpen = (
        onClose = jest.fn(),
        onSubmit: jest.Mock = jest.fn(),
        extraProps: Partial<AddVideoReviewModalProps> = {},
    ) => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const utils = render(
            <AddVideoReviewModal
                mode={ModalMode.Add}
                isOpen={true}
                onClose={onClose}
                onSubmit={onSubmit}
                onSuccess={onSuccess}
                onError={onError}
                {...extraProps}
            />,
        );
        return { ...utils, onClose, onSubmit, onSuccess, onError };
    };

    const getSubmitButton = () => screen.getByRole('button', { name: SUBMIT_BUTTON_NAME });
    const getTitleInput = () =>
        screen.getByLabelText(FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.TITLE, { exact: false });
    const getLinkInput = () => screen.getByLabelText(FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.LINK, { exact: false });
    const getCloseButton = () => screen.getByRole('button', { name: 'Close modal' });

    const fillForm = (title = validTitle, link = validLink) => {
        fireEvent.change(getTitleInput(), { target: { value: title } });
        fireEvent.change(getLinkInput(), { target: { value: link } });
    };

    it('renders title and both fields empty and editable on open', () => {
        renderOpen();
        expect(screen.getByText(FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.TITLE)).toBeInTheDocument();
        expect(getTitleInput()).toHaveValue('');
        expect(getLinkInput()).toHaveValue('');
        expect(getTitleInput()).not.toBeDisabled();
        expect(getLinkInput()).not.toBeDisabled();
    });

    it('shows a live counter at 0 of the max length for the title field only', () => {
        renderOpen();
        expect(screen.getByText(`0/${VIDEO_REVIEW_VALIDATION.title.max}`)).toBeInTheDocument();
        expect(screen.queryByText(`0/${VIDEO_REVIEW_VALIDATION.link.max}`)).not.toBeInTheDocument();
    });

    it('does not render the draft button', () => {
        renderOpen();
        expect(screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).not.toBeInTheDocument();
    });

    it('updates counters as the admin types', () => {
        renderOpen();
        fireEvent.change(getTitleInput(), { target: { value: 'Hello' } });
        expect(screen.getByText(`5/${VIDEO_REVIEW_VALIDATION.title.max}`)).toBeInTheDocument();
    });

    describe('submit button disabled state (#3459)', () => {
        it('is disabled by default', () => {
            renderOpen();
            expect(getSubmitButton()).toBeDisabled();
        });

        it('stays disabled when only one field is valid', () => {
            renderOpen();
            fireEvent.change(getTitleInput(), { target: { value: validTitle } });
            expect(getSubmitButton()).toBeDisabled();
        });

        it('becomes enabled when both fields are valid', () => {
            renderOpen();
            fillForm();
            expect(getSubmitButton()).not.toBeDisabled();
        });

        it('re-evaluates live and becomes disabled again when a field becomes invalid', () => {
            renderOpen();
            fillForm();
            expect(getSubmitButton()).not.toBeDisabled();

            fireEvent.change(getTitleInput(), { target: { value: 'ab' } });
            expect(getSubmitButton()).toBeDisabled();
        });
    });

    const expectRequiredErrorOnBlur = (getInput: () => HTMLElement) => {
        fireEvent.blur(getInput());
        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    };

    describe('title field validation (#3458)', () => {
        it('shows required error on blur when empty', () => {
            renderOpen();
            expectRequiredErrorOnBlur(getTitleInput);
        });

        it('treats a value with only spaces as empty', () => {
            renderOpen();
            fireEvent.change(getTitleInput(), { target: { value: '   ' } });
            fireEvent.blur(getTitleInput());
            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
        });

        it('shows min length error when shorter than 5 characters after trim', () => {
            renderOpen();
            fireEvent.change(getTitleInput(), { target: { value: 'abcd' } });
            fireEvent.blur(getTitleInput());
            expect(
                screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(VIDEO_REVIEW_VALIDATION.title.min)),
            ).toBeInTheDocument();
        });

        it('collapses consecutive spaces while typing (space management)', () => {
            renderOpen();
            fireEvent.change(getTitleInput(), { target: { value: 'Hello   world' } });
            expect(getTitleInput()).toHaveValue('Hello world');
        });

        it('trims leading and trailing spaces on blur', () => {
            renderOpen();
            fireEvent.change(getTitleInput(), { target: { value: '  Valid title  ' } });
            fireEvent.blur(getTitleInput());
            expect(getTitleInput()).toHaveValue('Valid title');
        });
    });

    describe('link field validation (#3458)', () => {
        it('shows required error on blur when empty', () => {
            renderOpen();
            expectRequiredErrorOnBlur(getLinkInput);
        });

        it('shows min length error when shorter than 10 characters after trim', () => {
            renderOpen();
            fireEvent.change(getLinkInput(), { target: { value: 'short' } });
            fireEvent.blur(getLinkInput());
            expect(
                screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(VIDEO_REVIEW_VALIDATION.link.min)),
            ).toBeInTheDocument();
        });

        it('rejects a non-http(s) link', () => {
            renderOpen();
            fireEvent.change(getLinkInput(), { target: { value: 'javascript:alert(1)' } });
            fireEvent.blur(getLinkInput());
            expect(screen.getByText(VIDEO_REVIEW_VALIDATION.link.getFormatError())).toBeInTheDocument();
        });

        it('accepts a valid https link', () => {
            renderOpen();
            fireEvent.change(getLinkInput(), { target: { value: validLink } });
            fireEvent.blur(getLinkInput());
            expect(screen.queryByText(VIDEO_REVIEW_VALIDATION.link.getFormatError())).not.toBeInTheDocument();
        });

        it('collapses consecutive spaces while typing (space management)', () => {
            renderOpen();
            fireEvent.change(getLinkInput(), { target: { value: 'https://example.com/a    b' } });
            expect(getLinkInput()).toHaveValue('https://example.com/a b');
        });
    });

    describe('submit behaviour (add mode)', () => {
        it('shows the publish confirmation when the submit button is clicked', () => {
            renderOpen();
            fillForm();
            fireEvent.click(getSubmitButton());

            expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
            expect(screen.getByText(FEEDBACK_TEXT.PUBLISH_MODAL.TITLE_NEW)).toBeInTheDocument();
        });

        it('does not call onSubmit when the publish confirmation is cancelled', () => {
            const onSubmit = jest.fn();
            renderOpen(jest.fn(), onSubmit);
            fillForm();
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-no'));

            expect(onSubmit).not.toHaveBeenCalled();
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        });

        it('calls onSubmit with normalized values', async () => {
            const onSubmit = jest.fn().mockResolvedValue(mockInitialData);
            renderOpen(jest.fn(), onSubmit);
            fillForm('  Valid title  ', `  ${validLink}  `);
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            await waitFor(() =>
                expect(onSubmit).toHaveBeenCalledWith(
                    { title: 'Valid title', link: validLink, status: VisibilityStatus.Published },
                    undefined,
                ),
            );
        });

        it('closes when onSubmit resolves', async () => {
            const createdVideo = { ...mockInitialData, id: 6 };
            const { onClose, onSuccess } = renderOpen(jest.fn(), jest.fn().mockResolvedValue(createdVideo));
            fillForm();
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith(createdVideo, ModalMode.Add);
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it('keeps the modal open and calls onError when onSubmit rejects', async () => {
            const { onClose, onSuccess, onError } = renderOpen(
                jest.fn(),
                jest.fn().mockRejectedValue(new Error('fail')),
            );
            fillForm();
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            await waitFor(() => expect(onError).toHaveBeenCalledWith(ModalMode.Add));
            expect(onSuccess).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
            expect(getTitleInput()).toHaveValue(validTitle);
        });

        it('disables the submit button while submitting', async () => {
            let resolveSubmit!: (value: FeedbackVideoDto) => void;
            const onSubmit = jest.fn().mockReturnValue(
                new Promise<FeedbackVideoDto>((resolve) => {
                    resolveSubmit = resolve;
                }),
            );
            renderOpen(jest.fn(), onSubmit);
            fillForm();
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            expect(getSubmitButton()).toBeDisabled();
            await act(async () => {
                resolveSubmit(mockInitialData);
            });
        });
    });

    describe('close behavior ("X" button, #3457)', () => {
        const requestCloseWithDraftTitle = (onClose = jest.fn()) => {
            renderOpen(onClose);
            fireEvent.change(getTitleInput(), { target: { value: 'draft' } });
            fireEvent.click(getCloseButton());
            return onClose;
        };

        it('closes immediately when both fields are empty', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.click(getCloseButton());
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
        });

        it('shows the unsaved-changes confirmation when a field has data', () => {
            const onClose = requestCloseWithDraftTitle();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
            expect(
                screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE, {
                    normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
                }),
            ).toBeInTheDocument();
        });

        it('closes and clears the form when confirming close', () => {
            const onClose = requestCloseWithDraftTitle();
            fireEvent.click(screen.getByTestId('confirm-yes'));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('keeps the modal open with entered data when cancelling close', () => {
            const onClose = requestCloseWithDraftTitle();
            fireEvent.click(screen.getByTestId('confirm-no'));
            expect(onClose).not.toHaveBeenCalled();
            expect(getTitleInput()).toHaveValue('draft');
        });
    });

    describe('edit mode (#3467)', () => {
        const renderEdit = (onSubmit: jest.Mock = jest.fn(), props: Partial<AddVideoReviewModalProps> = {}) =>
            renderOpen(jest.fn(), onSubmit, { mode: ModalMode.Edit, videoToEdit: mockInitialData, ...props });

        it('pre-fills both fields with the current data and shows the edit title', () => {
            renderEdit();
            expect(screen.getByText(FEEDBACK_TEXT.EDIT_VIDEO_REVIEW_MODAL.TITLE)).toBeInTheDocument();
            expect(getTitleInput()).toHaveValue(mockInitialData.title);
            expect(getLinkInput()).toHaveValue(mockInitialData.link);
        });

        it('keeps the publish button disabled until a field actually changes', () => {
            renderEdit();
            expect(getSubmitButton()).toBeDisabled();
        });

        it('enables the publish button once a field differs from the initial value', () => {
            renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            expect(getSubmitButton()).not.toBeDisabled();
        });

        it('disables the publish button again when the value is reverted back to the original', () => {
            renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            expect(getSubmitButton()).not.toBeDisabled();

            fireEvent.change(getTitleInput(), { target: { value: mockInitialData.title } });
            expect(getSubmitButton()).toBeDisabled();
        });

        it('stays disabled when the changed value is invalid', () => {
            renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'ab' } });
            expect(getSubmitButton()).toBeDisabled();
        });

        it('opens the publish-confirmation popup instead of saving immediately', () => {
            renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            fireEvent.click(getSubmitButton());

            expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
            expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();
        });

        it('keeps the modal open with unsaved changes when cancelling the publish-confirmation', () => {
            const { onSubmit } = renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-no'));

            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
            expect(onSubmit).not.toHaveBeenCalled();
            expect(getTitleInput()).toHaveValue('Updated title value');
        });

        it('disables the form and ignores close attempts while the save request is in flight', async () => {
            let resolveUpdate!: (video: FeedbackVideoDto) => void;
            const pendingSubmit = jest.fn().mockReturnValue(
                new Promise<FeedbackVideoDto>((resolve) => {
                    resolveUpdate = resolve;
                }),
            );

            const { onClose } = renderEdit(pendingSubmit);
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));

            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
            expect(getTitleInput()).toBeDisabled();
            expect(getSubmitButton()).toBeDisabled();
            expect(pendingSubmit).toHaveBeenCalledTimes(1);

            fireEvent.click(getCloseButton());
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();

            await act(async () => {
                resolveUpdate({ ...mockInitialData, title: 'Updated title value' });
            });
        });

        it('saves with normalized values and preserved status on confirm', async () => {
            const updatedVideo: FeedbackVideoDto = { ...mockInitialData, title: 'Updated title value' };

            const { onClose, onSubmit, onSuccess } = renderEdit(jest.fn().mockResolvedValue(updatedVideo));
            fireEvent.change(getTitleInput(), { target: { value: '  Updated title value  ' } });
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        title: 'Updated title value',
                        link: mockInitialData.link,
                        status: mockInitialData.status,
                    },
                    mockInitialData,
                );
                expect(onSuccess).toHaveBeenCalledWith(updatedVideo, ModalMode.Edit);
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it('keeps the modal open and calls onError when the update request fails', async () => {
            const { onClose, onSuccess, onError } = renderEdit(jest.fn().mockRejectedValue(new Error('network error')));
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            fireEvent.click(getSubmitButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));

            await waitFor(() => expect(onError).toHaveBeenCalledWith(ModalMode.Edit));
            expect(onSuccess).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(getTitleInput()).toHaveValue('Updated title value');
        });

        it('closes immediately on "X" without edits, since pre-filled values are not unsaved changes', () => {
            const { onClose } = renderEdit();
            fireEvent.click(getCloseButton());
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
        });

        it('shows the unsaved-changes confirmation on "X" once a field actually changes', () => {
            const { onClose } = renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            fireEvent.click(getCloseButton());
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
        });

        it('refills the fields when reopened with a different record', () => {
            const baseProps = {
                mode: ModalMode.Edit,
                onClose: jest.fn(),
                onSubmit: jest.fn(),
                onSuccess: jest.fn(),
                onError: jest.fn(),
            };
            const { rerender } = render(
                <AddVideoReviewModal {...baseProps} isOpen={true} videoToEdit={mockInitialData} />,
            );
            expect(getTitleInput()).toHaveValue(mockInitialData.title);

            const otherVideo: FeedbackVideoDto = {
                id: 9,
                title: 'Another video title',
                link: 'https://example.com/other',
                status: VisibilityStatus.Published,
                priority: 2,
                localizations: [],
            };
            rerender(<AddVideoReviewModal {...baseProps} isOpen={false} videoToEdit={mockInitialData} />);
            rerender(<AddVideoReviewModal {...baseProps} isOpen={true} videoToEdit={otherVideo} />);

            expect(getTitleInput()).toHaveValue(otherVideo.title);
            expect(getLinkInput()).toHaveValue(otherVideo.link);
        });
    });
});
