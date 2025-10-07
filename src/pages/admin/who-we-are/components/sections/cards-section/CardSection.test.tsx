import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardsSection, CardsSectionProps } from './CardsSection';
import '@testing-library/jest-dom';
import { ContentType } from '../../../../../../types/common/about-us';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';
import { Image } from '../../../../../../types/common/image';

// Mock child components to isolate the component being tested
jest.mock('../../card-content/CardContent', () => ({
    CardContent: ({
        content,
        onImageChange,
        onChange,
        onDescriptionBlur,
        descriptionError,
        imageError,
        setImageError,
        descriptionLimit,
        imageInputProps,
        rows,
    }: any) => (
        <div data-testid={`mock-card-content-${content.id}`}>
            <textarea
                data-testid={`mock-textarea-${content.id}`}
                onChange={onChange}
                onBlur={onDescriptionBlur}
                value={content.description}
            />
            {descriptionError && <span data-testid={`desc-error-${content.id}`}>{descriptionError}</span>}
            <input
                data-testid={`mock-image-input-${content.id}`}
                onChange={(e) => onImageChange(e.target.value)}
                onBlur={() => setImageError('test image error')}
            />
            {imageError && <span data-testid={`image-error-${content.id}`}>{imageError}</span>}
        </div>
    ),
}));

// Mock the validation function to control its behavior during tests
jest.mock('../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(),
    },
}));

describe('CardsSection', () => {
    let mockOnChange: jest.Mock;
    let mockOnPublish: jest.Mock;
    let mockSetIsPublishButtonActive: jest.Mock;
    const descriptionLimit = 500;
    const cardImageConfigs = [{ style: { width: '20rem' }, width: 20, height: 20, subText: '200x200' }];
    const titleText = 'Our Values';

    const mockContent = [
        {
            id: 1,
            contentType: ContentType.Card,
            description: 'Card 1 description',
            image: {
                id: 1,
                url: 'https://example.com/card/1',
                mimeType: 'image/png',
            } as Image,
            imageId: 10,
            title: null,
        },
        {
            id: 2,
            contentType: ContentType.Card,
            description: 'Card 2 description',
            image: {
                id: 2,
                url: 'https://example.com/card/2124',
                mimeType: 'image/png',
            } as Image,
            imageId: 2,
            title: null,
        },
    ];

    const renderComponent = (props: Partial<CardsSectionProps> = {}) => {
        const defaultProps: CardsSectionProps = {
            content: mockContent,
            descriptionLimit,
            onChange: mockOnChange,
            onPublish: mockOnPublish,
            cardImageConfigs,
            titleText,
            isPublishButtonActive: false,
            setIsPublishButtonActive: mockSetIsPublishButtonActive,
        };
        return render(<CardsSection {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        mockOnChange = jest.fn();
        mockOnPublish = jest.fn();
        mockSetIsPublishButtonActive = jest.fn();
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(null);
    });

    it('should render the component with correct number of cards and a title', () => {
        renderComponent();
        expect(screen.getByText(titleText)).toBeInTheDocument();
        expect(screen.getAllByTestId(/mock-card-content-/)).toHaveLength(2);
        expect(screen.getByRole('button', { name: 'Опублікувати' })).toBeInTheDocument();
    });

    it('should not render if content is null or there are no card items', () => {
        const { container: nullContentContainer } = renderComponent({ content: undefined });
        expect(nullContentContainer).toBeEmptyDOMElement();

        const { container: noCardsContainer } = renderComponent({
            content: [
                {
                    id: 3,
                    contentType: ContentType.Description,
                    description: 'test',
                    image: null,
                    imageId: null,
                    title: null,
                },
            ],
        });
        expect(noCardsContainer).toBeEmptyDOMElement();
    });

    it('should call onChange and setIsPublishButtonActive on description change', () => {
        renderComponent();
        const textarea = screen.getByTestId('mock-textarea-1');
        const newDescription = 'Updated description for card 1.';

        fireEvent.change(textarea, { target: { value: newDescription } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1,
                description: newDescription,
            }),
        );
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should call onChange and setIsPublishButtonActive on image change', () => {
        renderComponent();
        const imageInput = screen.getByTestId('mock-image-input-1');
        const newImage = { id: 20, base64: 'new-image.png' };

        fireEvent.change(imageInput, { target: { value: newImage } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1,
                image: newImage,
            }),
        );
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should display a description validation error and disable the publish button', async () => {
        const errorMessage = 'Description cannot be empty.';
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(errorMessage);

        renderComponent();
        const textarea = screen.getByTestId('mock-textarea-1');

        fireEvent.blur(textarea);

        await waitFor(() => {
            expect(screen.getByTestId('desc-error-1')).toHaveTextContent(errorMessage);
            const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
            expect(publishButton).toBeDisabled();
        });
    });

    it('should display an image error and disable the publish button', async () => {
        renderComponent();
        const imageInput = screen.getByTestId('mock-image-input-1');

        fireEvent.blur(imageInput);

        await waitFor(() => {
            expect(screen.getByTestId('image-error-1')).toHaveTextContent('test image error');
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

    it('should keep the publish button disabled if there are any validation errors', () => {
        renderComponent({ isPublishButtonActive: true });

        // Simulate a validation error state
        fireEvent.blur(screen.getByTestId('mock-textarea-1'));

        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeDisabled();
        expect(mockOnPublish).not.toHaveBeenCalled();
    });
});
