import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageSection, ImageSectionProps } from './ImageBlockSection';
import { ContentType } from '../../../../../../types/common/about-us';
import { WHO_WE_ARE_TEXT } from '../../../../../../const/admin/who-we-are';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';
import {Image} from "../../../../../../types/common/image";

// Mock child components to isolate the component being tested
jest.mock('../../../../../../components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ value, onChange, label, setError, ...rest }: any) => (
        <div data-testid="mock-image-input">
            <label htmlFor="mock-image-input-id">{label}</label>
            <input
                data-testid="mock-image-input-file"
                type="file"
                onChange={(e) => onChange(e.target.files?.[0])}
                id="mock-image-input-id"
            />
            <button onClick={() => setError('image size error')}>Set Error</button>
        </div>
    ),
}));

jest.mock('../../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({ onChange, value, maxLength, onBlur, ...rest }: any) => (
        <input data-testid="mock-title-input" onChange={onChange} value={value} maxLength={maxLength} onBlur={onBlur} />
    ),
}));

jest.mock('../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: ({ onChange, value, maxLength, onBlur, ...rest }: any) => (
        <textarea data-testid="mock-description-textarea" onChange={onChange} value={value} maxLength={maxLength} onBlur={onBlur} />
    ),
}));

// Mock the validation function to control its behavior during tests
jest.mock('../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn((value) => {
            if (value === 'Initial Title') return null;
            if (value === 'short') return 'Title is too short.';
            if (value === 'short_desc') return 'Description is too short.';
            return null;
        }),
    },
}));

describe('ImageSection', () => {
    let mockOnChange: jest.Mock;
    let mockOnPublish: jest.Mock;
    let mockSetIsPublishButtonActive: jest.Mock;
    const titleLimit = 50;
    const descriptionLimit = 500;

    const renderComponent = (props: Partial<ImageSectionProps> = {}) => {
        const defaultProps: ImageSectionProps = {
            content: [
                { id: 1, contentType: ContentType.Image, image: {
                        id : 1,
                        url: "https://example.com/card/1",
                        mimeType: 'image/png',
                    } as Image, title : null, imageId : 1, description: null },
                { id: 2, contentType: ContentType.Title, title: 'Initial Title', image: null, imageId : null, description: null  },
                { id: 3, contentType: ContentType.Description, description: 'Initial Description', title: null, imageId: null, image: null },
            ],
            titleLimit,
            descriptionLimit,
            onChange: mockOnChange,
            onPublish: mockOnPublish,
            imageInputProps: {
                style: { width: '100%' },
                subText: '1000x800',
            },
            isPublishButtonActive: false,
            setIsPublishButtonActive: mockSetIsPublishButtonActive,
        };
        return render(<ImageSection {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        mockOnChange = jest.fn();
        mockOnPublish = jest.fn();
        mockSetIsPublishButtonActive = jest.fn();
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(null);
    });

    it('should render the component with initial values and no errors', () => {
        renderComponent();

        expect(screen.getByLabelText(WHO_WE_ARE_TEXT.IMAGE.INPUT)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();

        const titleInput = screen.getByTestId('mock-title-input');
        expect(titleInput).toHaveValue('Initial Title');
        expect(titleInput).toHaveAttribute('maxLength', titleLimit.toString());

        const descriptionTextarea = screen.getByTestId('mock-description-textarea');
        expect(descriptionTextarea).toHaveValue('Initial Description');
        expect(descriptionTextarea).toHaveAttribute('maxLength', descriptionLimit.toString());

        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeInTheDocument();
        expect(publishButton).toBeDisabled();
    });

    it('should not render if content is null or if description content is missing', () => {
        // Test for null content (expect container to be empty)
        const { container: nullContentContainer } = renderComponent({ content: undefined });
        expect(nullContentContainer).toBeEmptyDOMElement();

        // This test case correctly covers the `if (!descriptionContent)` line
        const { container: noDescriptionContainer } = renderComponent({
            content: [{ id: 1, contentType: ContentType.Image, title: null, description: null, imageId: null, image: null }, { id: 2, contentType: ContentType.Title, title: null, description: null, imageId: null, image: null }],
        });
        expect(noDescriptionContainer).toBeEmptyDOMElement();
    });

    it('should call onChange and setIsPublishButtonActive on image change', () => {
        renderComponent();
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('mock-image-input-file');

        fireEvent.change(input, { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            contentType: ContentType.Image,
            image: file,
        }));
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should call onChange and setIsPublishButtonActive on title change', () => {
        renderComponent();
        const titleInput = screen.getByTestId('mock-title-input');
        const newTitle = 'New Title';

        fireEvent.change(titleInput, { target: { value: newTitle } });

        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            contentType: ContentType.Title,
            title: newTitle,
        }));
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should call onChange and setIsPublishButtonActive on description change', () => {
        renderComponent();
        const descriptionTextarea = screen.getByTestId('mock-description-textarea');
        const newDescription = 'New Description';

        fireEvent.change(descriptionTextarea, { target: { value: newDescription } });

        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            contentType: ContentType.Description,
            description: newDescription,
        }));
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should show validation errors and disable the publish button', async () => {
        renderComponent();

        const titleInput = screen.getByTestId('mock-title-input');
        const descriptionTextarea = screen.getByTestId('mock-description-textarea');

        fireEvent.change(titleInput, { target: { value: 'short' } });
        fireEvent.blur(titleInput);

        fireEvent.change(descriptionTextarea, { target: { value: 'short_desc' } });
        fireEvent.blur(descriptionTextarea);

        await waitFor(() => {
            expect(screen.getByText('Title is too short.')).toBeInTheDocument();
            expect(screen.getByText('Description is too short.')).toBeInTheDocument();
            const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
            expect(publishButton).toBeDisabled();
        });
    });

    it('should enable the publish button and call onPublish when clicked', () => {
        renderComponent({ isPublishButtonActive: true });

        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeEnabled();

        fireEvent.click(publishButton);
        expect(mockOnPublish).toHaveBeenCalled();
    });
});