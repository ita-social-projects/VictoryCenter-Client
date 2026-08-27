import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GalleryCard } from './GalleryCard';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HippotherapyGalleryCardContent } from '@/types/admin/hippotherapy-page';

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, setError, disabled }: any) => (
        <div data-testid="mock-image-input">
            <input
                data-testid="mock-image-input-file"
                type="file"
                disabled={disabled}
                onChange={(e) => !disabled && onChange(e.target.files?.[0])}
            />
            <button type="button" onClick={() => !disabled && setError('image size error')}>
                Set Error
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ label, onChange, onBlur, value, id, disabled, error }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => !disabled && onChange(e.target.value)}
                onBlur={() => !disabled && onBlur?.()}
                value={value}
                id={id}
                disabled={disabled}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

describe('GalleryCard', () => {
    let onDescriptionChange: jest.Mock;
    let onImageChange: jest.Mock;
    let onImageError: jest.Mock;

    const card: HippotherapyGalleryCardContent = {
        description: 'Card description',
        image: null,
        imageId: null,
    };

    const renderComponent = (props = {}) =>
        render(
            <GalleryCard
                card={card}
                fieldId="test-card-0"
                onDescriptionChange={onDescriptionChange}
                onImageChange={onImageChange}
                onImageError={onImageError}
                {...props}
            />,
        );

    beforeEach(() => {
        onDescriptionChange = jest.fn();
        onImageChange = jest.fn();
        onImageError = jest.fn();
    });

    it('renders the description and the image input', () => {
        renderComponent();

        expect(screen.getByTestId('mock-rich-input-test-card-0-description')).toHaveValue('Card description');
        expect(screen.getByTestId('mock-image-input')).toBeInTheDocument();
    });

    it('calls onDescriptionChange without validating', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-card-0-description'), { target: { value: 'x' } });

        expect(onDescriptionChange).toHaveBeenCalledWith('x');
        expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).not.toBeInTheDocument();
    });

    it('shows a description error on blur when the value is empty', () => {
        renderComponent({ card: { ...card, description: '' } });

        fireEvent.blur(screen.getByTestId('mock-rich-input-test-card-0-description'));

        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it('does not show a description error when the image input is blurred', () => {
        renderComponent({ card: { ...card, description: '' } });

        fireEvent.blur(screen.getByTestId('mock-image-input-file'));

        expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).not.toBeInTheDocument();
    });

    it('calls onImageChange with the selected file', () => {
        renderComponent();

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(onImageChange).toHaveBeenCalledWith(file);
    });

    it('reports the image error to the parent', () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: 'Set Error' }));

        expect(onImageError).toHaveBeenCalledWith('image size error');
    });

    it('renders the image error passed from the parent', () => {
        renderComponent({ imageError: 'image size error' });

        expect(screen.getByText('image size error')).toBeInTheDocument();
    });

    it('disables both inputs when disabled is true', () => {
        renderComponent({ disabled: true });

        expect(screen.getByTestId('mock-image-input-file')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-test-card-0-description')).toBeDisabled();
    });
});
