import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddFeedbackHistoryModal, AddFeedbackHistoryModalProps } from './AddFeedbackHistoryModal';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { IMAGE_DIMENSION_VALIDATION_FUNCTIONS } from '@/validation/admin/image-dimension-schema/image-dimension-schema';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto } from '@/types/admin/feedback';
import { ImageValues } from '@/types/common/image';

jest.mock('@/validation/admin/image-schema/image-schema', () => ({
    IMAGE_VALIDATION_FUNCTIONS: {
        validateImage: jest.fn().mockResolvedValue(null),
    },
}));

jest.mock('@/validation/admin/image-dimension-schema/image-dimension-schema', () => ({
    IMAGE_DIMENSION_VALIDATION_FUNCTIONS: {
        validateImage: jest.fn(),
    },
}));

jest.mock('@/components/admin/cropper-modal/CropperModal', () => ({
    CropModal: ({ isOpen, onChange }: { isOpen: boolean; onChange: (img: ImageValues | null) => void }) => {
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
    const onSubmit = jest.fn();
    const onSuccess = jest.fn();

    const renderModal = (props: Partial<AddFeedbackHistoryModalProps> = {}) =>
        render(
            <AddFeedbackHistoryModal
                mode={ModalMode.Add}
                isOpen={true}
                onClose={onClose}
                onSubmit={onSubmit}
                onSuccess={onSuccess}
                {...props}
            />,
        );

    const mockCreatedHistory: FeedbackHistoryDto = {
        id: 1,
        title: 'Успішна історія',
        story: 'Детальний опис історії перемоги',
        image: { id: 10, url: 'https://example.com/photo.jpg', mimeType: 'image/jpeg' },
        status: VisibilityStatus.Published,
        priority: 0,
        localizations: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (IMAGE_DIMENSION_VALIDATION_FUNCTIONS.validateImage as jest.Mock).mockResolvedValue(
            'Image dimensions do not match',
        );
    });

    const setupDirtyFormAndClose = async (titleValue: string) => {
        renderModal();
        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: titleValue } });
        await waitFor(() => {
            expect(titleInput).toHaveValue(titleValue);
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
        return titleInput;
    };

    const fillValidForm = async (title: string, story: string) => {
        fireEvent.change(screen.getByRole('textbox', { name: /заголовок/i }), { target: { value: title } });
        fireEvent.change(screen.getByRole('textbox', { name: /історія/i }), { target: { value: story } });
        const fileInput = screen.getByTestId('image-input-hidden');
        const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
        const cropConfirmBtn = await screen.findByTestId('crop-confirm-button');
        fireEvent.click(cropConfirmBtn);
    };

    it('renders modal with correct title, empty fields, live counters, active X button, and disabled publish button', () => {
        renderModal();

        expect(screen.getByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE)).toBeInTheDocument();

        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        expect(closeBtn).toBeInTheDocument();
        expect(closeBtn).not.toBeDisabled();

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        expect(titleInput).toBeInTheDocument();
        expect(titleInput).toHaveValue('');
        expect(screen.getByText('0/50')).toBeInTheDocument();

        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
        expect(storyTextarea).toBeInTheDocument();
        expect(storyTextarea).toHaveValue('');
        expect(screen.getByText('0/1000')).toBeInTheDocument();

        expect(screen.getByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_LABEL)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_SUBTEXT)).toBeInTheDocument();

        const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        expect(publishBtn).toBeInTheDocument();
        expect(publishBtn).toBeDisabled();
    });

    it('does not render modal when isOpen is false', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByText(FEEDBACK_TEXT.ADD_HISTORY_MODAL.TITLE)).not.toBeInTheDocument();
    });

    it('updates text fields and counters when typing', async () => {
        renderModal();

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Тестова історія' } });
        await waitFor(() => {
            expect(titleInput).toHaveValue('Тестова історія');
            expect(screen.getByText('15/50')).toBeInTheDocument();
        });

        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
        fireEvent.change(storyTextarea, { target: { value: 'Опис нової історії' } });
        await waitFor(() => {
            expect(storyTextarea).toHaveValue('Опис нової історії');
            expect(screen.getByText('18/1000')).toBeInTheDocument();
        });
    });

    it('shows validation error when inputs are too short', async () => {
        renderModal();

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.change(titleInput, { target: { value: 'Коротко' } });
        fireEvent.blur(titleInput);
        await waitFor(() => {
            expect(screen.getByText('Не менше 10 символів')).toBeInTheDocument();
        });

        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
        fireEvent.change(storyTextarea, { target: { value: 'Опис' } });
        fireEvent.blur(storyTextarea);
        await waitFor(() => {
            expect(screen.getAllByText('Не менше 10 символів')).toHaveLength(2);
        });
    });

    it('validates text fields in real-time during typing (onChange)', async () => {
        renderModal();

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });

        fireEvent.change(titleInput, { target: { value: 'Коротко' } });
        await waitFor(() => {
            expect(screen.getByText('Не менше 10 символів')).toBeInTheDocument();
        });

        fireEvent.change(titleInput, { target: { value: 'Достатня назва' } });
        await waitFor(() => {
            expect(screen.queryByText('Не менше 10 символів')).not.toBeInTheDocument();
        });

        fireEvent.change(titleInput, { target: { value: '' } });
        await waitFor(() => {
            expect(screen.getByText("Поле обов'язкове")).toBeInTheDocument();
        });

        const storyTextarea = screen.getByRole('textbox', { name: /історія/i });

        fireEvent.change(storyTextarea, { target: { value: 'Опис' } });
        await waitFor(() => {
            expect(screen.getByText('Не менше 10 символів')).toBeInTheDocument();
        });

        fireEvent.change(storyTextarea, { target: { value: 'Достатньо довгий опис історії' } });
        await waitFor(() => {
            expect(screen.queryByText('Не менше 10 символів')).not.toBeInTheDocument();
        });
    });

    it('clears field when clean-up icon is clicked', async () => {
        renderModal();

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        fireEvent.focus(titleInput);
        fireEvent.change(titleInput, { target: { value: 'Тест' } });

        await waitFor(() => {
            expect(titleInput).toHaveValue('Тест');
        });

        const clearButtons = await screen.findAllByRole('button', { name: 'Clear input' });
        expect(clearButtons.length).toBeGreaterThan(0);
        fireEvent.click(clearButtons[0]);

        await waitFor(() => {
            expect(titleInput).toHaveValue('');
            expect(screen.getByText('0/50')).toBeInTheDocument();
        });
    });

    it('closes modal directly when X button is clicked and all fields are empty', () => {
        renderModal();

        const closeBtn = screen.getByRole('button', { name: 'Close modal' });
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(/зміни будуть втрачені/i)).not.toBeInTheDocument();
    });

    it('shows confirmation pop-up when X button is clicked and at least one field is not empty', async () => {
        await setupDirtyFormAndClose('Щось введено');

        await waitFor(() => {
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByText(/зміни будуть втрачені/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
        });
    });

    it('keeps modal open and preserves filled fields when NO is clicked in confirmation pop-up', async () => {
        const titleInput = await setupDirtyFormAndClose('Збережений заголовок');

        const noBtn = await screen.findByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO });
        fireEvent.click(noBtn);

        await waitFor(() => {
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByText(/зміни будуть втрачені/i)).not.toBeInTheDocument();
            expect(titleInput).toHaveValue('Збережений заголовок');
        });
    });

    it('closes modal and discards inputs when YES is clicked in confirmation pop-up', async () => {
        await setupDirtyFormAndClose('Втрачений заголовок');

        const yesBtn = await screen.findByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        fireEvent.click(yesBtn);

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('does not render the draft button', () => {
        renderModal();

        expect(screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).not.toBeInTheDocument();
    });

    it('enables publish button when title, story and image are provided, and submits successfully', async () => {
        onSubmit.mockResolvedValueOnce(mockCreatedHistory);

        renderModal();

        const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        expect(publishBtn).toBeDisabled();

        await fillValidForm('Перемога 2026', 'Неймовірна історія успіху та реабілітації');

        await waitFor(() => {
            expect(publishBtn).not.toBeDisabled();
        });

        fireEvent.click(publishBtn);

        const confirmBtn = await screen.findByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Перемога 2026',
                    story: 'Неймовірна історія успіху та реабілітації',
                    image: expect.objectContaining({ base64: 'cropped-base64' }),
                    status: VisibilityStatus.Published,
                }),
                undefined,
            );
            expect(onSuccess).toHaveBeenCalledWith(mockCreatedHistory, ModalMode.Add);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('displays error message when history creation fails', async () => {
        onSubmit.mockRejectedValueOnce(new Error('Network error'));

        renderModal();

        await fillValidForm('Тестовий заголовок', 'Довгий опис для тестування');

        const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        await waitFor(() => {
            expect(publishBtn).not.toBeDisabled();
        });

        fireEvent.click(publishBtn);

        const confirmBtn = await screen.findByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.getByText(FEEDBACK_TEXT.MESSAGE.FAIL_TO_PUBLISH)).toBeInTheDocument();
        });

        expect(onClose).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    describe('Edit Mode', () => {
        const mockInitialData: FeedbackHistoryDto = {
            id: 2,
            title: 'Існуючий заголовок',
            story: 'Це існуюча історія для перевірки редагування',
            image: { id: 20, url: 'https://example.com/existing.jpg', mimeType: 'image/jpeg' },
            status: VisibilityStatus.Published,
            priority: 1,
            localizations: [],
        };

        it('pre-populates fields with initialData and disables publish button initially', async () => {
            renderModal({ mode: ModalMode.Edit, historyToEdit: mockInitialData });

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /заголовок/i })).toHaveValue('Існуючий заголовок');
                expect(screen.getByRole('textbox', { name: /історія/i })).toHaveValue(
                    'Це існуюча історія для перевірки редагування',
                );
            });

            expect(screen.getByText(FEEDBACK_TEXT.EDIT_HISTORY_MODAL.TITLE)).toBeInTheDocument();

            const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
            expect(publishBtn).toBeDisabled();
        });

        it('enables publish button when story is changed', async () => {
            renderModal({ mode: ModalMode.Edit, historyToEdit: mockInitialData });

            const storyTextarea = screen.getByRole('textbox', { name: /історія/i });
            fireEvent.change(storyTextarea, { target: { value: 'Оновлена історія' } });

            const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
            await waitFor(() => {
                expect(publishBtn).not.toBeDisabled();
            });
        });

        it('enables publish button when image is changed', async () => {
            renderModal({ mode: ModalMode.Edit, historyToEdit: mockInitialData });

            const fileInput = screen.getByTestId('image-input-hidden');
            const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
            fireEvent.change(fileInput, { target: { files: [file] } });

            const cropConfirmBtn = await screen.findByTestId('crop-confirm-button');
            fireEvent.click(cropConfirmBtn);

            const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
            await waitFor(() => {
                expect(publishBtn).not.toBeDisabled();
            });
        });

        const setupEditModeAndClickPublish = async (historyToEdit: FeedbackHistoryDto = mockInitialData) => {
            renderModal({ mode: ModalMode.Edit, historyToEdit });

            const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
            fireEvent.change(titleInput, { target: { value: 'Оновлений заголовок' } });

            const publishBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
            await waitFor(() => {
                expect(publishBtn).not.toBeDisabled();
            });

            fireEvent.click(publishBtn);

            const confirmModalTitle = await screen.findByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES);
            expect(confirmModalTitle).toBeInTheDocument();
        };

        it('enables publish button when a field is changed, shows confirm modal and calls update API', async () => {
            const updatedHistory = { ...mockInitialData, title: 'Оновлений заголовок' };
            onSubmit.mockResolvedValueOnce(updatedHistory);

            await setupEditModeAndClickPublish();

            const yesBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
            fireEvent.click(yesBtn);

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        title: 'Оновлений заголовок',
                        story: 'Це існуюча історія для перевірки редагування',
                        image: mockInitialData.image,
                        status: VisibilityStatus.Published,
                    },
                    mockInitialData,
                );
                expect(onSuccess).toHaveBeenCalledWith(updatedHistory, ModalMode.Edit);
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it('keeps modal open and discards publish when NO is clicked in publish confirmation', async () => {
            await setupEditModeAndClickPublish();

            const noBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO });
            fireEvent.click(noBtn);

            await waitFor(() => {
                expect(screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).not.toBeInTheDocument();
                expect(onSubmit).not.toHaveBeenCalled();
            });
        });

        it('displays error message when history update fails', async () => {
            onSubmit.mockRejectedValueOnce(new Error('Network error'));

            await setupEditModeAndClickPublish();
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

            expect(await screen.findByText(FEEDBACK_TEXT.MESSAGE.FAIL_TO_UPDATE)).toBeInTheDocument();
            expect(onSuccess).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
        });
    });
});
