import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddFeedbackHistoryModal } from './AddFeedbackHistoryModal';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto } from '@/types/admin/feedback';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/services/api/admin/feedback/feedback-api', () => ({
    FeedbackApi: {
        createHistory: jest.fn(),
    },
}));

jest.mock('@/services/api/admin/image/image-api', () => ({
    ImageApi: {
        post: jest.fn(),
    },
}));

jest.mock('@/validation/admin/image-schema/image-schema', () => ({
    IMAGE_VALIDATION_FUNCTIONS: {
        validateImage: jest.fn().mockResolvedValue(null),
    },
}));

jest.mock('@/components/admin/cropper-modal/CropperModal', () => ({
    CropModal: ({ isOpen, onChange }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="cropper">
                <button
                    data-testid="crop-confirm-button"
                    onClick={() => onChange({ base64: 'cropped-base64', mimeType: 'image/png' })}
                >
                    Crop Confirm
                </button>
            </div>
        );
    },
}));

describe('AddFeedbackHistoryModal', () => {
    const onClose = jest.fn();
    const onAddHistory = jest.fn();

    const mockCreatedHistory: FeedbackHistoryDto = {
        id: 1,
        title: 'Успішна історія',
        story: 'Детальний опис історії перемоги',
        image: { id: 10, url: 'https://example.com/photo.jpg', mimeType: 'image/jpeg' },
        status: VisibilityStatus.Published,
        priority: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue({});
    });

    it('renders modal with correct title, empty fields, live counters, active X button, and disabled publish button', () => {
        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        // Title
        expect(screen.getByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE)).toBeInTheDocument();

        // X button active
        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        expect(closeBtn).toBeInTheDocument();
        expect(closeBtn).not.toBeDisabled();

        // Title input & counter
        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        expect(titleInput).toBeInTheDocument();
        expect(titleInput).toHaveValue('');
        expect(screen.getByText('0/50')).toBeInTheDocument();

        // Story textarea & counter
        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
        expect(storyTextarea).toBeInTheDocument();
        expect(storyTextarea).toHaveValue('');
        expect(screen.getByText('0/1000')).toBeInTheDocument();

        // Photo upload placeholder
        expect(screen.getByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_LABEL)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_SUBTEXT)).toBeInTheDocument();

        // Publish button disabled
        const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        expect(publishBtn).toBeInTheDocument();
        expect(publishBtn).toBeDisabled();
    });

    it('does not render modal when isOpen is false', () => {
        render(<AddFeedbackHistoryModal isOpen={false} onClose={onClose} onAddHistory={onAddHistory} />);

        expect(screen.queryByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE)).not.toBeInTheDocument();
    });

    it('updates text fields and counters when typing', () => {
        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Тестова історія' } });
        expect(titleInput).toHaveValue('Тестова історія');
        expect(screen.getByText('15/50')).toBeInTheDocument();

        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
        fireEvent.change(storyTextarea, { target: { value: 'Опис нової історії' } });
        expect(storyTextarea).toHaveValue('Опис нової історії');
        expect(screen.getByText('18/1000')).toBeInTheDocument();
    });

    it('clears field when clean-up icon is clicked', () => {
        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.focus(titleInput);
        fireEvent.change(titleInput, { target: { value: 'Тест' } });

        const clearButtons = screen.getAllByRole('button', { name: 'Clear input' });
        expect(clearButtons.length).toBeGreaterThan(0);
        fireEvent.click(clearButtons[0]);

        expect(titleInput).toHaveValue('');
        expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('closes modal directly when X button is clicked and all fields are empty', () => {
        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(/зміни будуть втрачені/i)).not.toBeInTheDocument();
    });

    it('shows confirmation pop-up when X button is clicked and at least one field is not empty', () => {
        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Щось введено' } });

        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        fireEvent.click(closeBtn);

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByText(/зміни будуть втрачені/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
    });

    it('keeps modal open and preserves filled fields when NO is clicked in confirmation pop-up', () => {
        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Збережений заголовок' } });

        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        fireEvent.click(closeBtn);

        const noBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO });
        fireEvent.click(noBtn);

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.queryByText(/зміни будуть втрачені/i)).not.toBeInTheDocument();
        expect(titleInput).toHaveValue('Збережений заголовок');
    });

    it('closes modal and discards inputs when YES is clicked in confirmation pop-up', () => {
        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Втрачений заголовок' } });

        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        fireEvent.click(closeBtn);

        const yesBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        fireEvent.click(yesBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('enables publish button when title, story and image are provided, and submits successfully', async () => {
        (FeedbackApi.createHistory as jest.Mock).mockResolvedValueOnce(mockCreatedHistory);
        (ImageApi.post as jest.Mock).mockResolvedValueOnce({ id: 10, url: 'https://example.com/photo.jpg' });

        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        expect(publishBtn).toBeDisabled();

        // Fill Title
        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Перемога 2026' } });
        expect(publishBtn).toBeDisabled();

        // Fill Story
        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
        fireEvent.change(storyTextarea, { target: { value: 'Неймовірна історія успіху та реабілітації' } });
        expect(publishBtn).toBeDisabled();

        // Upload image file
        const fileInput = screen.getByTestId('image-input-hidden');
        const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        const cropConfirmBtn = await screen.findByTestId('crop-confirm-button');
        fireEvent.click(cropConfirmBtn);

        await waitFor(() => {
            expect(publishBtn).not.toBeDisabled();
        });

        fireEvent.click(publishBtn);

        await waitFor(() => {
            expect(FeedbackApi.createHistory).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    title: 'Перемога 2026',
                    story: 'Неймовірна історія успіху та реабілітації',
                    status: VisibilityStatus.Published,
                }),
            );
            expect(onAddHistory).toHaveBeenCalledWith(mockCreatedHistory);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('displays error message when history creation fails', async () => {
        (FeedbackApi.createHistory as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<AddFeedbackHistoryModal isOpen={true} onClose={onClose} onAddHistory={onAddHistory} />);

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Заголовок' } });

        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
        fireEvent.change(storyTextarea, { target: { value: 'Опис' } });

        const fileInput = screen.getByTestId('image-input-hidden');
        const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        const cropConfirmBtn = await screen.findByTestId('crop-confirm-button');
        fireEvent.click(cropConfirmBtn);

        const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        await waitFor(() => {
            expect(publishBtn).not.toBeDisabled();
        });

        fireEvent.click(publishBtn);

        await waitFor(() => {
            expect(screen.getByText(FEEDBACK_TEXT.MESSAGE.FAIL_TO_CREATE_HISTORY)).toBeInTheDocument();
        });

        expect(onClose).not.toHaveBeenCalled();
        expect(onAddHistory).not.toHaveBeenCalled();
    });
});
