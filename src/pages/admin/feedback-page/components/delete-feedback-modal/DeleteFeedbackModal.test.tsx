import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteFeedbackModal } from './DeleteFeedbackModal';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { VisibilityStatus } from '@/types/admin/common';
import { FeedbackCategory, FeedbackHistoryDto } from '@/types/admin/feedback';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/services/api/admin/feedback/feedback-api', () => ({
    FeedbackApi: {
        deleteFeedback: jest.fn(),
    },
}));

describe('DeleteFeedbackModal', () => {
    const onClose = jest.fn();
    const onDeleteItem = jest.fn();

    const mockHistory: FeedbackHistoryDto = {
        id: 123,
        title: 'Тестова історія',
        story: 'Опис тестової історії',
        image: null,
        status: VisibilityStatus.Published,
        priority: 1,
    };

    const defaultProps = {
        isOpen: true,
        onClose,
        category: FeedbackCategory.HISTORY,
        itemToDelete: mockHistory,
        onDeleteItem,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue({});
    });

    it('renders modal when open with title and buttons', () => {
        render(<DeleteFeedbackModal {...defaultProps} />);

        expect(screen.getByText(FEEDBACK_TEXT.DELETE_MODAL.TITLE)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
    });

    it('does not render modal content when closed', () => {
        const { container } = render(<DeleteFeedbackModal {...defaultProps} isOpen={false} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('calls onClose when clicking "No" button and does not call delete API', () => {
        render(<DeleteFeedbackModal {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(FeedbackApi.deleteFeedback).not.toHaveBeenCalled();
    });

    it('calls delete API and callbacks on successful confirm delete', async () => {
        (FeedbackApi.deleteFeedback as jest.Mock).mockResolvedValue(undefined);

        render(<DeleteFeedbackModal {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(FeedbackApi.deleteFeedback).toHaveBeenCalledWith(
                expect.anything(),
                FeedbackCategory.HISTORY,
                mockHistory.id,
            );
            expect(onDeleteItem).toHaveBeenCalledWith(mockHistory);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('passes the active category to the delete API', async () => {
        (FeedbackApi.deleteFeedback as jest.Mock).mockResolvedValue(undefined);

        render(<DeleteFeedbackModal {...defaultProps} category={FeedbackCategory.REVIEWS} />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(FeedbackApi.deleteFeedback).toHaveBeenCalledWith(
                expect.anything(),
                FeedbackCategory.REVIEWS,
                mockHistory.id,
            );
        });
    });

    it('shows error message and logs to console when delete API fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Delete error');
        (FeedbackApi.deleteFeedback as jest.Mock).mockRejectedValue(error);

        render(<DeleteFeedbackModal {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(screen.getByText(FEEDBACK_TEXT.DELETE_MODAL.FAIL_TO_DELETE)).toBeInTheDocument();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete feedback item:', error);
        expect(onDeleteItem).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it('does nothing when confirming without itemToDelete', () => {
        render(<DeleteFeedbackModal {...defaultProps} itemToDelete={null} />);

        const yesBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });

        expect(yesBtn).toBeDisabled();
        fireEvent.click(yesBtn);

        expect(FeedbackApi.deleteFeedback).not.toHaveBeenCalled();
    });
});
