import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardContent } from './CardContent';
import { ContentType } from '@/types/common/about-us';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { Image } from '@/types/common/image';
import { RichTextInputGroupProps } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ label, onChange, value, maxLength, onBlur, id, error }: RichTextInputGroupProps) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => onChange(e.target.value)}
                value={value}
                maxLength={maxLength}
                onBlur={onBlur}
                id={id}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, label, setError }: any) => (
        <div data-testid="mock-image-input">
            <label>{label}</label>
            <input data-testid="mock-image-input-file" type="file" onChange={(e) => onChange(e.target.files?.[0])} />
            <button onClick={() => setError('image size error')}>Set Error</button>
        </div>
    ),
}));

describe('CardContent', () => {
    let mockOnChange: jest.Mock;
    let mockOnDescriptionValidate: jest.Mock;
    let mockSetImageError: jest.Mock;
    let mockSetIsPublishButtonActive: jest.Mock;
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
            setIsPublishButtonActive: mockSetIsPublishButtonActive,
        };
        return render(<CardContent {...baseProps} {...props} />);
    };

    beforeEach(() => {
        mockOnChange = jest.fn();
        mockSetImageError = jest.fn();
        mockSetIsPublishButtonActive = jest.fn();
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

    it('should call onChange, onDescriptionValidate on change, and onDescriptionValidate on blur', () => {
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

    it('should call onChange, setIsPublishButtonActive on image change, and call setImageError', () => {
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
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
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
});
