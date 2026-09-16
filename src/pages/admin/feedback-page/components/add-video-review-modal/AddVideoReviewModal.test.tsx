import { render, screen, fireEvent, waitFor, act, getDefaultNormalizer } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT, VIDEO_REVIEW_VALIDATION } from '@/const/admin/feedback';
import { AddVideoReviewModal } from './AddVideoReviewModal';

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel, onClose }: any) => (
        <div data-testid="confirm-modal" data-open={String(isOpen)}>
            <span>{title}</span>
            <button data-testid="confirm-yes" onClick={onConfirm}>
                Yes
            </button>
            <button data-testid="confirm-no" onClick={onCancel}>
                No
            </button>
            <button data-testid="confirm-close" onClick={onClose}>
                Close
            </button>
        </div>
    ),
}));

describe('AddVideoReviewModal', () => {
    const SUBMIT_BUTTON_NAME = COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED;
    const validTitle = 'A valid video review title';
    const validLink = 'https://example.com/video';

    const renderOpen = (onClose = jest.fn(), onSubmit?: jest.Mock) =>
        render(<AddVideoReviewModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

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

    describe('title field validation (#3458)', () => {
        it('shows required error on blur when empty', () => {
            renderOpen();
            fireEvent.blur(getTitleInput());
            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
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
            fireEvent.blur(getLinkInput());
            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
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

    describe('submit behaviour', () => {
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
    });

    describe('close behavior ("X" button, #3457)', () => {
        it('closes immediately when both fields are empty', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.click(getCloseButton());
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
        });

        it('shows the unsaved-changes confirmation when a field has data', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(getTitleInput(), { target: { value: 'draft' } });
            fireEvent.click(getCloseButton());
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'true');
            expect(
                screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE, {
                    normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
                }),
            ).toBeInTheDocument();
        });

        it('closes and clears the form when confirming close', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(getTitleInput(), { target: { value: 'draft' } });
            fireEvent.click(getCloseButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('keeps the modal open with entered data when cancelling close', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(getTitleInput(), { target: { value: 'draft' } });
            fireEvent.click(getCloseButton());
            fireEvent.click(screen.getByTestId('confirm-no'));
            expect(onClose).not.toHaveBeenCalled();
            expect(getTitleInput()).toHaveValue('draft');
        });
    });
});
