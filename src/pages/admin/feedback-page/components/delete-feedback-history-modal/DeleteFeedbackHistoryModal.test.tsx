import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteFeedbackHistoryModal } from './DeleteFeedbackHistoryModal';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto } from '@/types/admin/feedback';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/services/api/admin/feedback/feedback-api', () => ({
    FeedbackApi: {
        deleteHistory: jest.fn(),
    },
}));

describe('DeleteFeedbackHistoryModal', () => {
    const onClose = jest.fn();
    const onDeleteHistory = jest.fn();

    const mockHistory: FeedbackHistoryDto = {
        id: 123,
        title: 'Тестова історія',
        story: 'Опис тестової історії',
        image: null,
        status: VisibilityStatus.Published,
        priority: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue({});
    });

    it('renders modal when open with title and buttons', () => {
        render(
            <DeleteFeedbackHistoryModal
                isOpen={true}
                onClose={onClose}
                historyToDelete={mockHistory}
                onDeleteHistory={onDeleteHistory}
            />,
        );

        expect(screen.getByText(FEEDBACK_TEXT.DELETE_HISTORY_MODAL.TITLE)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
    });

    it('does not render modal content when closed', () => {
        const { container } = render(
            <DeleteFeedbackHistoryModal
                isOpen={false}
                onClose={onClose}
                historyToDelete={mockHistory}
                onDeleteHistory={onDeleteHistory}
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('calls onClose when clicking "No" button and does not call delete API', () => {
        render(
            <DeleteFeedbackHistoryModal
                isOpen={true}
                onClose={onClose}
                historyToDelete={mockHistory}
                onDeleteHistory={onDeleteHistory}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(FeedbackApi.deleteHistory).not.toHaveBeenCalled();
    });

    it('calls delete API and callbacks on successful confirm delete', async () => {
        (FeedbackApi.deleteHistory as jest.Mock).mockResolvedValue(undefined);

        render(
            <DeleteFeedbackHistoryModal
                isOpen={true}
                onClose={onClose}
                historyToDelete={mockHistory}
                onDeleteHistory={onDeleteHistory}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(FeedbackApi.deleteHistory).toHaveBeenCalledWith(expect.anything(), 123);
            expect(onDeleteHistory).toHaveBeenCalledWith(mockHistory);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('shows error message when delete API fails', async () => {
        (FeedbackApi.deleteHistory as jest.Mock).mockRejectedValue(new Error('Delete error'));

        render(
            <DeleteFeedbackHistoryModal
                isOpen={true}
                onClose={onClose}
                historyToDelete={mockHistory}
                onDeleteHistory={onDeleteHistory}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(screen.getByText(FEEDBACK_TEXT.DELETE_HISTORY_MODAL.FAIL_TO_DELETE)).toBeInTheDocument();
        });

        expect(onDeleteHistory).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('does nothing when confirming without historyToDelete', async () => {
        render(
            <DeleteFeedbackHistoryModal
                isOpen={true}
                onClose={onClose}
                historyToDelete={null}
                onDeleteHistory={onDeleteHistory}
            />,
        );

        const yesBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        expect(yesBtn).toBeDisabled();
        fireEvent.click(yesBtn);

        expect(FeedbackApi.deleteHistory).not.toHaveBeenCalled();
    });
});
