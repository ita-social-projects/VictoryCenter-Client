import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventModal } from './EventModal';
import { executeCancelCofirmationFlow, executeConfirmCloseFlow } from '@/utils/test-mocks/events-modals-mocks';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { EventItemDto } from '@/types/admin/events';
import { ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { EVENTS_TEXT, EVENT_VALIDATION as mockEventValidation } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const getTodayLabel = () => {
    const today = new Date();

    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(
        2,
        '0',
    )}/${today.getFullYear()}`;
};

const openDatePickerAndSelectToday = (todayLabel: string) => {
    fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
    fireEvent.click(screen.getByRole('button', { name: todayLabel }));
};

const expectDatePickerClosed = () => {
    expect(screen.queryByRole('dialog', { name: 'Вибір дати' })).not.toBeInTheDocument();
};

jest.mock('@/components/common/modal/Modal', () => ({
    Modal: require('@/utils/test-mocks/events-modals-mocks').MockModal,
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, error, name, id, label, onBlur }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input name={name} id={id} value={value} onChange={onChange} onBlur={onBlur} />
            {error && <span data-testid="input-error">{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: require('@/utils/test-mocks/events-modals-mocks').MockButton,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: require('@/utils/test-mocks/events-modals-mocks').MockConfirmationModal,
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, error, name, id, label, onBlur }: any) => (
            <div>
                <label htmlFor={id}>{label}</label>
                <textarea name={name} id={id} value={value} onChange={onChange} onBlur={onBlur} />
                {error && <span data-testid="description-error">{error}</span>}
            </div>
        ),
    }),
);

jest.mock('@/components/admin/image-input/ImageInput', () => {
    const getImageSrc = (image: any) => {
        if (!image) return '';
        if (typeof image === 'string') return image;
        if ('url' in image && image.url) return image.url;
        if ('base64' in image) return `data:${image.mimeType};base64,${image.base64}`;
        return '';
    };

    return {
        ImageInput: ({ value, onChange, setError }: Pick<ImageInputProps, 'value' | 'onChange' | 'setError'>) => (
            <div data-testid="image-input">
                {value && <img data-testid="event-image-preview" src={getImageSrc(value)} alt="preview" />}
                <button
                    type="button"
                    data-testid="upload-valid-image"
                    onClick={() => {
                        setError('');
                        onChange({ base64: 'test-base64-data', mimeType: 'image/png' });
                    }}
                >
                    Upload Image
                </button>
                <button
                    type="button"
                    data-testid="trigger-image-error"
                    onClick={() =>
                        setError(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB))
                    }
                >
                    Trigger Error
                </button>
            </div>
        ),
        getImageSrc,
    };
});

const currentCategory: EventCategoryDto | null = {
    id: 1,
    name: 'Category 1',
    relatedEventNewsCount: 0,
};

const defaultProps = {
    mode: ModalMode.Add as const,
    isOpen: true,
    onClose: jest.fn(),
    currentCategory,
};

const eventToEdit: EventItemDto = {
    id: 1,
    resource: 'https://example.com',
    publishedAt: '2026-08-18T00:00:00Z',
    title: 'Завершилась програма',
    description: 'Цього тижня ми успішно завершили програму реабілітації',
    status: VisibilityStatus.Draft,
    previewImage: null,
    backgroundImage: null,
};

const eventWithImage: EventItemDto = {
    ...eventToEdit,
    previewImage: { id: 7, url: 'https://example.com/event.png', mimeType: 'image/png' },
};

describe('EventModal', () => {
    describe('elements rendering', () => {
        it('renders modal title', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent(EVENTS_TEXT.FORM.MODAL_TITLE);
        });

        it('prefills the form with the event data in edit mode', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            expect(screen.getByDisplayValue(eventToEdit.title)).toBeInTheDocument();
            expect(screen.getByDisplayValue(eventToEdit.description)).toBeInTheDocument();
            expect(screen.getByDisplayValue(eventToEdit.resource)).toBeInTheDocument();
            expect(screen.getByText('18/08/2026')).toBeInTheDocument();
        });

        it('shows the edit title in edit mode', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            expect(screen.getByTestId('modal-title')).toHaveTextContent(EVENTS_TEXT.FORM.EDIT_MODAL_TITLE);
        });

        it('renders link section title', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(EVENTS_TEXT.FORM.LINKS_SECTION_TITLE)).toBeInTheDocument();
        });

        it('renders all input fields', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.DESCRIPTION })).toBeInTheDocument();
            expect(
                screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION }),
            ).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_UKR })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_ENG })).toBeInTheDocument();
        });

        it('renders date picker trigger', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByRole('button', { name: /Вибір дати/i })).toBeInTheDocument();
        });

        it('renders category chip when currentCategory is provided', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(currentCategory.name)).toBeInTheDocument();
        });

        it('does not render category chip when currentCategory is null', () => {
            render(<EventModal {...defaultProps} currentCategory={null} />);

            expect(screen.queryByText(currentCategory.name)).not.toBeInTheDocument();
        });

        it('renders modal buttons in disable state initially', () => {
            render(<EventModal {...defaultProps} />);

            const saveAsDraftButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT });
            const saveAsPublishedButton = screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
            });

            expect(saveAsDraftButton).toBeInTheDocument();
            expect(saveAsPublishedButton).toBeInTheDocument();

            expect(saveAsDraftButton).toBeDisabled();
            expect(saveAsPublishedButton).toBeDisabled();
        });

        it('sets validation error on blur', async () => {
            render(<EventModal {...defaultProps} />);

            const input = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });

            fireEvent.change(input, {
                target: { value: '' },
            });

            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByTestId('input-error')).toHaveTextContent(
                    mockEventValidation.title.getRequiredError(),
                );
            });
        });
    });

    describe('close behavior', () => {
        it('calls onClose immediately when form is not dirty', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('shows confirmation modal when form has unsaved changes', () => {
            render(<EventModal {...defaultProps} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        it('does not close the modal when confirmation is cancelled', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            executeCancelCofirmationFlow(onClose);
        });

        it('closes the modal when unsaved changes are confirmed', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            executeConfirmCloseFlow(onClose);
        });
    });

    describe('modal opening', () => {
        it('resets form when modal is opened', () => {
            const { rerender } = render(<EventModal {...defaultProps} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            expect(titleInput).toHaveValue('New Event');

            rerender(<EventModal {...defaultProps} isOpen={false} />);

            rerender(<EventModal {...defaultProps} />);

            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.DESCRIPTION })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION })).toHaveValue(
                '',
            );
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_UKR })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_ENG })).toHaveValue('');
        });
    });

    describe('date picker', () => {
        it('applies the selected date only after confirming', () => {
            render(<EventModal {...defaultProps} />);
            const todayLabel = getTodayLabel();

            openDatePickerAndSelectToday(todayLabel);
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));

            expect(screen.getByRole('button', { name: `Вибір дати: ${todayLabel}` })).toBeInTheDocument();
            expectDatePickerClosed();
        });

        it('discards a pending date when cancelled', () => {
            render(<EventModal {...defaultProps} />);
            const todayLabel = getTodayLabel();

            openDatePickerAndSelectToday(todayLabel);
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

            expect(screen.getByRole('button', { name: /Вибір дати/i })).toHaveTextContent('');
            expectDatePickerClosed();
        });

        it('deselects a day and confirms the current date when no date remains selected', () => {
            render(<EventModal {...defaultProps} />);
            const todayLabel = getTodayLabel();

            openDatePickerAndSelectToday(todayLabel);
            expect(screen.getByRole('button', { name: todayLabel })).toHaveAttribute('aria-pressed', 'false');

            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));

            expect(screen.getByRole('button', { name: `Вибір дати: ${todayLabel}` })).toBeInTheDocument();
            expectDatePickerClosed();
        });

        it('opens month and year selection from the calendar header', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: 'Вибрати місяць і рік' }));

            expect(screen.getByRole('button', { name: String(new Date().getFullYear()) })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Січ' })).toBeInTheDocument();
        });

        it('opens a month calendar with an inactive confirmation button', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: 'Вибрати місяць і рік' }));
            fireEvent.click(screen.getByRole('button', { name: 'Січ' }));

            expect(screen.getByText('ПН')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK })).toBeDisabled();
            expect(screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Вибрати місяць і рік' })).not.toBeInTheDocument();
        });

        it('does not allow interaction with the parent date picker while the month selector is open', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: 'Вибрати місяць і рік' }));

            expect(screen.queryByText('ПН')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK })).not.toBeInTheDocument();
        });
    });

    describe('image handling', () => {
        it('renders image section label and upload component initially', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(EVENTS_TEXT.FORM.LABEL.IMAGE)).toBeInTheDocument();
            expect(screen.getByTestId('image-input')).toBeInTheDocument();
            expect(screen.queryByTestId('event-image-preview')).not.toBeInTheDocument();
        });

        it('renders image preview when an image is selected', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('upload-valid-image'));

            expect(screen.getByTestId('event-image-preview')).toBeInTheDocument();
            expect(screen.getByTestId('event-image-preview')).toHaveAttribute(
                'src',
                'data:image/png;base64,test-base64-data',
            );
            expect(screen.getByTestId('image-input')).toBeInTheDocument();
        });

        it('displays error message when image validation fails', async () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('trigger-image-error'));

            const errorMessage = await screen.findByText(
                mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB),
            );
            expect(errorMessage).toBeInTheDocument();
        });

        it('clears image error when a valid image is selected', async () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('trigger-image-error'));
            expect(
                await screen.findByText(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB)),
            ).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('upload-valid-image'));

            await waitFor(() => {
                expect(
                    screen.queryByText(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB)),
                ).not.toBeInTheDocument();
            });
        });

        it('shows confirmation modal on close when image was added (isDirty state)', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('upload-valid-image'));
            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });
    });

    describe('edit mode', () => {
        it('keeps the save buttons disabled in edit mode until something changes', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeDisabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('enables both buttons after a valid change when all publish fields are filled', async () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventWithImage} />);

            fireEvent.change(screen.getByDisplayValue(eventWithImage.title), { target: { value: 'Нова назва події' } });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            });
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
        });

        it('enables only the draft button when a field required for publishing is empty', async () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.title), { target: { value: 'Нова назва події' } });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            });
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('keeps the save buttons disabled in edit mode when the change is invalid', async () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.title), { target: { value: 'Коротко' } });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeDisabled();
            });
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('collapses repeated spaces in the title while typing', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.title), { target: { value: 'Нова  назва  події' } });

            expect(screen.getByDisplayValue('Нова назва події')).toBeInTheDocument();
        });

        it('collapses repeated spaces in the link while typing', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.resource), {
                target: { value: 'https://example.com/  news' },
            });

            expect(screen.getByDisplayValue('https://example.com/ news')).toBeInTheDocument();
        });
    });
});
