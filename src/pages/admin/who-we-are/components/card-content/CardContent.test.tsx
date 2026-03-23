import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardContent } from './CardContent';
import { ContentType } from '@/types/common/about-us';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { Image } from '@/types/common/image';
import { RichTextInputGroupProps } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({
        label,
        onChange,
        value,
        maxLength,
        onBlur,
        id,
        error,
        disabled,
    }: RichTextInputGroupProps & { disabled?: boolean }) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => !disabled && onChange(e.target.value)}
                value={value}
                maxLength={maxLength}
                onBlur={onBlur}
                id={id}
                disabled={disabled}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, label, setError, disabled }: any) => (
        <div data-testid="mock-image-input">
            <label>{label}</label>
            <input
                data-testid="mock-image-input-file"
                type="file"
                disabled={disabled}
                onChange={(e) => !disabled && onChange(e.target.files?.[0])}
            />
            <button onClick={() => !disabled && setError('image size error')}>Set Error</button>
        </div>
    ),
}));

describe('CardContent', () => {
    let mockOnChange: jest.Mock;
    let mockOnDescriptionValidate: jest.Mock;
    let mockSetImageError: jest.Mock;
    const descriptionLimit = 250;

    const baseContent = {
        id: 1,
        contentType: ContentType.Card,
        description: 'Initial description',
        image: {
            id: 1,
            url: 'https://example.com/card/1',
            mimeType: 'image/png',
        } as Image,
        title: null,
        imageId: 10,
        localizations: [],
    };

    const renderComponent = (props = {}) => {
        const baseProps = {
            content: baseContent,
            onChange: mockOnChange,
            descriptionLimit,
            imageInputProps: {
                style: { width: '200px' },
                subText: '200x200',
            },
            onDescriptionValidate: mockOnDescriptionValidate,
            descriptionError: null,
            imageError: null,
            setImageError: mockSetImageError,
            language: { id: 1, code: 'uk', name: 'Ukrainian' },
        };
        return render(<CardContent {...baseProps} {...props} />);
    };

    beforeEach(() => {
        mockOnChange = jest.fn();
        mockSetImageError = jest.fn();
        mockOnDescriptionValidate = jest.fn();
    });

    it('should render the component with initial values and no errors', () => {
        renderComponent();

        expect(screen.getByText(WHO_WE_ARE_TEXT.IMAGE.INPUT)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();

        const descriptionInput = screen.getByTestId('mock-rich-input-1');
        expect(descriptionInput).toHaveValue('Initial description');
        expect(descriptionInput).toHaveAttribute('maxLength', descriptionLimit.toString());

        expect(screen.queryByText('This is a description error message.')).not.toBeInTheDocument();
        expect(screen.queryByText('This is an image error message.')).not.toBeInTheDocument();
    });

    it('should call onChange and onDescriptionValidate on change, and onDescriptionValidate on blur', () => {
        renderComponent();
        const descriptionInput = screen.getByTestId('mock-rich-input-1');
        const newDescription = 'New description text';

        fireEvent.change(descriptionInput, { target: { value: newDescription } });
        expect(mockOnChange).toHaveBeenCalledWith({
            ...baseContent,
            description: newDescription,
        });
        expect(mockOnDescriptionValidate).toHaveBeenCalledWith(newDescription);

        fireEvent.blur(descriptionInput);
        expect(mockOnDescriptionValidate).toHaveBeenCalled();
    });

    it('should call onChange on image change and setImageError on error', () => {
        renderComponent();
        const imageInputButton = screen.getByText('Set Error');

        fireEvent.click(imageInputButton);
        expect(mockSetImageError).toHaveBeenCalledWith('image size error');

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('mock-image-input-file');

        fireEvent.change(input, { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({
            ...baseContent,
            image: file,
        });
    });

    it('should display description error message when prop is provided', () => {
        const descriptionError = 'This is a description error message.';
        renderComponent({ descriptionError });

        expect(screen.getByText(descriptionError)).toBeInTheDocument();
    });

    it('should display image error message when prop is provided', () => {
        const imageError = 'This is an image error message.';
        renderComponent({ imageError });

        expect(screen.getByText(imageError)).toBeInTheDocument();
    });

    it('should handle a null image prop gracefully', () => {
        const contentWithNullImage = {
            ...baseContent,
            id: 2,
            description: 'No image card',
            image: null,
            imageId: null,
        };

        renderComponent({ content: contentWithNullImage });

        const imageInput = screen.getByTestId('mock-image-input');
        expect(imageInput).toBeInTheDocument();
    });

    it('should handle a null or undefined description prop and render an empty string', () => {
        const contentWithNullDescription = {
            ...baseContent,
            id: 3,
            description: null,
        };

        renderComponent({ content: contentWithNullDescription });

        const descriptionInput = screen.getByTestId('mock-rich-input-3');
        expect(descriptionInput).toHaveValue('');
    });

    it('should not allow edits when language is not the base locale', () => {
        renderComponent({ language: { id: 2, code: 'en', name: 'English' } });

        const descriptionInput = screen.getByTestId('mock-rich-input-1');
        fireEvent.change(descriptionInput, { target: { value: 'Attempt edit' } });

        expect(mockOnChange).not.toHaveBeenCalled();
        expect(mockOnDescriptionValidate).not.toHaveBeenCalled();

        const imageInput = screen.getByTestId('mock-image-input-file');
        expect(imageInput).toBeDisabled();

        const file = new File(['dummy'], 'file.png', { type: 'image/png' });
        fireEvent.change(imageInput, { target: { files: [file] } });

        expect(mockOnChange).not.toHaveBeenCalledWith(expect.objectContaining({ image: file }));
    });
});
