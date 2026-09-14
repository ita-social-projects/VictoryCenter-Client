import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventModal } from './EventModal';
import { executeCancelCofirmationFlow, executeConfirmCloseFlow } from '@/utils/test-mocks/events-modals-mocks';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { EVENTS_TEXT, EVENT_VALIDATION as mockEventValidation } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

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
});
