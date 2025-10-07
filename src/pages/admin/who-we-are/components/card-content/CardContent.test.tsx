import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardContent } from './CardContent';
import { ContentType } from '../../../../../types/common/about-us';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import { Image } from '../../../../../types/common/image';

jest.mock('../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: ({ onChange, value, maxLength, onBlur }: any) => (
        <textarea data-testid="mock-textarea" onChange={onChange} value={value} maxLength={maxLength} onBlur={onBlur} />
    ),
}));

jest.mock('../../../../../components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ value, onChange, label, setError, ...rest }: any) => (
        <div data-testid="mock-image-input">
            <label>{label}</label>
            <input data-testid="mock-image-input-file" type="file" onChange={(e) => onChange(e.target.files?.[0])} />
            <button onClick={() => setError('image size error')}>Set Error</button>
        </div>
    ),
}));

describe('CardContent', () => {
    let mockOnImageChange: jest.Mock;
    let mockOnChange: jest.Mock;
    let mockOnDescriptionBlur: jest.Mock;
    let mockSetImageError: jest.Mock;
    const descriptionLimit = 250;

    const renderComponent = (props = {}) => {
        const baseProps = {
            content: {
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
            },
            onImageChange: mockOnImageChange,
            onChange: mockOnChange,
            descriptionLimit,
            imageInputProps: {
                style: { width: '200px' },
                subText: '200x200',
            },
            onDescriptionBlur: mockOnDescriptionBlur,
            descriptionError: null,
            imageError: null,
            setImageError: mockSetImageError,
        };
        return render(<CardContent {...baseProps} {...props} />);
    };

    beforeEach(() => {
        mockOnImageChange = jest.fn();
        mockOnChange = jest.fn();
        mockOnDescriptionBlur = jest.fn();
        mockSetImageError = jest.fn();
    });

    it('should render the component with initial values and no errors', () => {
        renderComponent();

        expect(screen.getByText(WHO_WE_ARE_TEXT.IMAGE.INPUT)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();

        const textarea = screen.getByTestId('mock-textarea');
        expect(textarea).toHaveValue('Initial description');
        expect(textarea).toHaveAttribute('maxLength', descriptionLimit.toString());

        expect(screen.queryByText('This is a description error message.')).not.toBeInTheDocument();
        expect(screen.queryByText('This is an image error message.')).not.toBeInTheDocument();
    });

    it('should call onChange and onBlur for the description textarea', () => {
        renderComponent();
        const textarea = screen.getByTestId('mock-textarea');
        const newDescription = 'New description text';

        fireEvent.change(textarea, { target: { value: newDescription } });
        expect(mockOnChange).toHaveBeenCalled();

        fireEvent.blur(textarea);
        expect(mockOnDescriptionBlur).toHaveBeenCalled();
    });

    it('should call onImageChange and setImageError for the image input', () => {
        renderComponent();
        const imageInputButton = screen.getByText('Set Error');

        fireEvent.click(imageInputButton);
        expect(mockSetImageError).toHaveBeenCalledWith('image size error');

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('mock-image-input-file');
        fireEvent.change(input, { target: { files: [file] } });
        expect(mockOnImageChange).toHaveBeenCalledWith(file);
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
            id: 2,
            contentType: ContentType.Card,
            description: 'No image card',
            image: null,
            title: null,
            imageId: null,
        };

        renderComponent({ content: contentWithNullImage });

        const imageInput = screen.getByTestId('mock-image-input');
        expect(imageInput).toBeInTheDocument();
    });

    it('should handle a null or undefined description prop and render an empty string', () => {
        const contentWithNullDescription = {
            id: 3,
            contentType: ContentType.Card,
            description: null,
            image: {
                id: 1,
                url: 'https://example.com/card/1',
                mimeType: 'image/png',
            } as Image,
            title: null,
            imageId: 1,
        };

        renderComponent({ content: contentWithNullDescription });

        const textarea = screen.getByTestId('mock-textarea');
        expect(textarea).toHaveValue('');
    });
});
