import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DeleteEventCategoryConfirmModal } from './DeleteEventCategoryConfirmModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

describe('DeleteEventCategoryConfirmModal', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    const renderModal = (isSubmitting = false) => {
        render(
            <DeleteEventCategoryConfirmModal
                isOpen={true}
                isSubmitting={isSubmitting}
                onConfirm={onConfirm}
                onClose={onClose}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders confirmation modal with title and action buttons', () => {
        renderModal();

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY_CONFIRM)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
    });

    it('calls onClose when No button is clicked', async () => {
        const user = userEvent.setup();

        renderModal();

        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Yes button is clicked', async () => {
        const user = userEvent.setup();

        renderModal();

        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables action buttons while submitting', () => {
        renderModal(true);

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeDisabled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeDisabled();
    });

    it('does not call onClose when No button is clicked while submitting', async () => {
        const user = userEvent.setup();

        renderModal(true);

        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).not.toHaveBeenCalled();
    });
});
