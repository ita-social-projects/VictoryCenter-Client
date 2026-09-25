import { render, screen, fireEvent, waitFor, act, within, getDefaultNormalizer } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT, VIDEO_REVIEW_VALIDATION } from '@/const/admin/feedback';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FeedbackVideoDto } from '@/types/admin/feedback';
import { VisibilityStatus } from '@/types/admin/common';
import { AddVideoReviewModal, AddVideoReviewModalProps } from './AddVideoReviewModal';

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal');

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/services/api/admin/feedback/feedback-api', () => ({
    FeedbackApi: {
        updateVideo: jest.fn(),
    },
}));

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
        (useAdminClient as jest.Mock).mockReturnValue({});
    });

    const renderOpen = (
        onClose = jest.fn(),
        onSubmit?: jest.Mock,
        extraProps: Partial<AddVideoReviewModalProps> = {},
    ) => render(<AddVideoReviewModal isOpen={true} onClose={onClose} onSubmit={onSubmit} {...extraProps} />);

    const getSubmitButton = () => screen.getByRole('button', { name: SUBMIT_BUTTON_NAME });
    const getTitleInput = () =>
        screen.getByLabelText(FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.TITLE, { exact: false });
    const getLinkInput = () => screen.getByLabelText(FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.LINK, { exact: false });
    const getCloseButton = () => screen.getByRole('button', { name: 'Close modal' });

    const findConfirmModal = (title: string) =>
        screen
            .getByText(title, { normalizer: getDefaultNormalizer({ collapseWhitespace: false }) })
            .closest('[data-testid="confirm-modal"]') as HTMLElement;

    const getCloseConfirmModal = () =>
        findConfirmModal(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE);
    const getPublishConfirmModal = () => findConfirmModal(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES);

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
        it('calls onSubmit with normalized values', async () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderOpen(jest.fn(), onSubmit);
            fillForm('  Valid title  ', `  ${validLink}  `);
            fireEvent.click(getSubmitButton());
            await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ title: 'Valid title', link: validLink }));
        });

        it('resets the form and closes when onSubmit resolves true', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderOpen(onClose, onSubmit);
            fillForm();
            fireEvent.click(getSubmitButton());
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
        });

        it('keeps the modal open when onSubmit resolves false', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(false);
            renderOpen(onClose, onSubmit);
            fillForm();
            fireEvent.click(getSubmitButton());
            await waitFor(() => expect(onSubmit).toHaveBeenCalled());
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        });

        it('disables the submit button while submitting', async () => {
            let resolveSubmit!: (value: boolean) => void;
            const onSubmit = jest.fn().mockReturnValue(
                new Promise<boolean>((resolve) => {
                    resolveSubmit = resolve;
                }),
            );
            renderOpen(jest.fn(), onSubmit);
            fillForm();
            fireEvent.click(getSubmitButton());
            expect(getSubmitButton()).toBeDisabled();
            await act(async () => {
                resolveSubmit(true);
            });
        });

        it('does not open the publish-confirmation popup in add mode', () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderOpen(jest.fn(), onSubmit);
            fillForm();
            fireEvent.click(getSubmitButton());
            expect(getPublishConfirmModal()).toHaveAttribute('data-open', 'false');
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
            expect(getCloseConfirmModal()).toHaveAttribute('data-open', 'false');
        });

        it('shows the unsaved-changes confirmation when a field has data', () => {
            const onClose = requestCloseWithDraftTitle();
            expect(onClose).not.toHaveBeenCalled();
            expect(getCloseConfirmModal()).toHaveAttribute('data-open', 'true');
        });

        it('closes and clears the form when confirming close', () => {
            const onClose = requestCloseWithDraftTitle();
            fireEvent.click(within(getCloseConfirmModal()).getByTestId('confirm-yes'));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('keeps the modal open with entered data when cancelling close', () => {
            const onClose = requestCloseWithDraftTitle();
            fireEvent.click(within(getCloseConfirmModal()).getByTestId('confirm-no'));
            expect(onClose).not.toHaveBeenCalled();
            expect(getTitleInput()).toHaveValue('draft');
        });
    });

    describe('edit mode (#3467)', () => {
        const renderEdit = (props: Partial<AddVideoReviewModalProps> = {}) => {
            const onClose = jest.fn();
            const onEditVideoReview = jest.fn();
            const onEditError = jest.fn();
            renderOpen(onClose, undefined, {
                initialData: mockInitialData,
                onEditVideoReview,
                onEditError,
                ...props,
            });
            return { onClose, onEditVideoReview, onEditError };
        };

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

            expect(getPublishConfirmModal()).toHaveAttribute('data-open', 'true');
            expect(FeedbackApi.updateVideo).not.toHaveBeenCalled();
        });

        it('keeps the modal open with unsaved changes when cancelling the publish-confirmation', () => {
            renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            fireEvent.click(getSubmitButton());
            fireEvent.click(within(getPublishConfirmModal()).getByTestId('confirm-no'));

            expect(getPublishConfirmModal()).toHaveAttribute('data-open', 'false');
            expect(FeedbackApi.updateVideo).not.toHaveBeenCalled();
            expect(getTitleInput()).toHaveValue('Updated title value');
        });

        it('saves via FeedbackApi.updateVideo with normalized values and preserved status on confirm', async () => {
            const updatedVideo: FeedbackVideoDto = { ...mockInitialData, title: 'Updated title value' };
            (FeedbackApi.updateVideo as jest.Mock).mockResolvedValueOnce(updatedVideo);

            const { onClose, onEditVideoReview } = renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: '  Updated title value  ' } });
            fireEvent.click(getSubmitButton());
            fireEvent.click(within(getPublishConfirmModal()).getByTestId('confirm-yes'));

            await waitFor(() => {
                expect(FeedbackApi.updateVideo).toHaveBeenCalledWith({}, mockInitialData.id, {
                    title: 'Updated title value',
                    link: mockInitialData.link,
                    status: mockInitialData.status,
                });
                expect(onEditVideoReview).toHaveBeenCalledWith(updatedVideo);
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it('keeps the modal open and reports the error when the update request fails', async () => {
            (FeedbackApi.updateVideo as jest.Mock).mockRejectedValueOnce(new Error('network error'));

            const { onClose, onEditError, onEditVideoReview } = renderEdit();
            fireEvent.change(getTitleInput(), { target: { value: 'Updated title value' } });
            fireEvent.click(getSubmitButton());
            fireEvent.click(within(getPublishConfirmModal()).getByTestId('confirm-yes'));

            await waitFor(() => {
                expect(onEditError).toHaveBeenCalledTimes(1);
            });
            expect(onEditVideoReview).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(getTitleInput()).toHaveValue('Updated title value');
        });

        it('shows the unsaved-changes confirmation on "X" even without edits, since fields are pre-filled', () => {
            renderEdit();
            fireEvent.click(getCloseButton());
            expect(getCloseConfirmModal()).toHaveAttribute('data-open', 'true');
        });

        it('refills the fields when reopened with a different record', () => {
            const { rerender } = render(
                <AddVideoReviewModal isOpen={true} onClose={jest.fn()} initialData={mockInitialData} />,
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
            rerender(<AddVideoReviewModal isOpen={false} onClose={jest.fn()} initialData={mockInitialData} />);
            rerender(<AddVideoReviewModal isOpen={true} onClose={jest.fn()} initialData={otherVideo} />);

            expect(getTitleInput()).toHaveValue(otherVideo.title);
            expect(getLinkInput()).toHaveValue(otherVideo.link);
        });
    });
});
