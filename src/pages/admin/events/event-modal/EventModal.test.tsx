import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventModal } from './EventModal';
import { executeCancelCofirmationFlow, executeConfirmCloseFlow } from '@/utils/test-mocks/events-modals-mocks';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EVENTS_TEXT, EVENT_VALIDATION as mockEventValidation } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ImageInputProps } from '@/components/admin/image-input/ImageInput';

jest.mock('@/components/common/modal/Modal', () => ({
    Modal: require('@/utils/test-mocks/events-modals-mocks').MockModal,
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, error, name, id, label }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input name={name} id={id} value={value} onChange={onChange} />
            {error && <span data-testid="name-error">{error}</span>}
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
        TextAreaWithCharacterLimitGroup: ({ value, onChange, error, name, id, label }: any) => (
            <div>
                <label htmlFor={id}>{label}</label>
                <textarea name={name} id={id} value={value} onChange={onChange} />
                {error && <span data-testid="description-error">{error}</span>}
            </div>
        ),
    }),
);

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, setError }: Pick<ImageInputProps, 'onChange' | 'setError'>) => (
        <div data-testid="image-input">
            <button
                type="button"
                data-testid="upload-valid-image"
                onClick={() => onChange({ base64: 'test-base64-data', mimeType: 'image/png' })}
            >
                Upload Image
            </button>
            <button
                type="button"
                data-testid="trigger-image-error"
                onClick={() => setError(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB))}
            >
                Trigger Error
            </button>
        </div>
    ),
    getImageSrc: (image: any) => {
        if (!image) return '';
        if (typeof image === 'string') return image;
        if ('url' in image && image.url) return image.url;
        if ('base64' in image) return `data:${image.mimeType};base64,${image.base64}`;
        return '';
    },
}));

const currentCategory: EventCategoryDto | null = {
    id: 1,
    name: 'Category 1',
    relatedEventNewsCount: 0,
};

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentCategory,
};

describe('EventModal', () => {
    describe('elements rendering', () => {
        it('renders modal title', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent(EVENTS_TEXT.FORM.MODAL_TITLE);
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
            const today = new Date();
            const todayLabel = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(
                2,
                '0',
            )}/${today.getFullYear()}`;

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: todayLabel }));
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));

            expect(screen.getByRole('button', { name: `Вибір дати: ${todayLabel}` })).toBeInTheDocument();
            expect(screen.queryByRole('dialog', { name: 'Вибір дати' })).not.toBeInTheDocument();
        });

        it('discards a pending date when cancelled', () => {
            render(<EventModal {...defaultProps} />);
            const today = new Date();
            const todayLabel = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(
                2,
                '0',
            )}/${today.getFullYear()}`;

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: todayLabel }));
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

            expect(screen.getByRole('button', { name: /Вибір дати/i })).toHaveTextContent('');
            expect(screen.queryByRole('dialog', { name: 'Вибір дати' })).not.toBeInTheDocument();
        });

        it('deselects a day and confirms the current date when no date remains selected', () => {
            render(<EventModal {...defaultProps} />);
            const today = new Date();
            const todayLabel = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(
                2,
                '0',
            )}/${today.getFullYear()}`;

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: todayLabel }));
            expect(screen.getByRole('button', { name: todayLabel })).toHaveAttribute('aria-pressed', 'false');

            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));

            expect(screen.getByRole('button', { name: `Вибір дати: ${todayLabel}` })).toBeInTheDocument();
            expect(screen.queryByRole('dialog', { name: 'Вибір дати' })).not.toBeInTheDocument();
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
            expect(screen.queryByTestId('image-input')).not.toBeInTheDocument();
        });

        it('displays error message when image validation fails', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('trigger-image-error'));

            expect(
                screen.getByText(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB)),
            ).toBeInTheDocument();
        });

        it('clears image error when a valid image is selected', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('trigger-image-error'));
            expect(
                screen.getByText(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB)),
            ).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('upload-valid-image'));
            expect(
                screen.queryByText(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB)),
            ).not.toBeInTheDocument();
        });

        it('shows confirmation modal on close when image was added (isDirty state)', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('upload-valid-image'));
            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });
    });
});
