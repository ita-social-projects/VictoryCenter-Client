import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardsSection, CardsSectionProps } from './CardsSection';
import '@testing-library/jest-dom';
import { ContentType } from '@/types/common/about-us';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { Image, ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { CardContentProps } from '@/pages/admin/who-we-are/components/card-content/CardContent';

jest.mock('../../card-content/CardContent', () => ({
    CardContent: ({
        content,
        onChange,
        onDescriptionValidate,
        descriptionError,
        imageError,
        setImageError,
        setIsPublishButtonActive,
    }: CardContentProps) => (
        <div data-testid={`mock-card-content-${content.id}`}>
            <textarea
                data-testid={`mock-textarea-${content.id}`}
                onChange={(e) => {
                    onChange({ ...content, description: e.target.value });
                    onDescriptionValidate(e);
                }}
                onBlur={onDescriptionValidate}
                value={content.description ?? undefined}
            />
            {descriptionError && <span data-testid={`desc-error-${content.id}`}>{descriptionError}</span>}
            <input
                data-testid={`mock-image-input-${content.id}`}
                onChange={(e) => {
                    const newImage = JSON.parse(e.target.value);
                    onChange({ ...content, image: newImage });
                    setIsPublishButtonActive(true);
                }}
                onBlur={() => setImageError('test image error')}
            />
            {imageError && <span data-testid={`image-error-${content.id}`}>{imageError}</span>}
        </div>
    ),
}));

jest.mock('@/validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(),
    },
}));

describe('CardsSection', () => {
    let mockOnChange: jest.Mock;
    let mockOnPublish: jest.Mock;
    let mockSetIsPublishButtonActive: jest.Mock;
    const descriptionLimit = 500;
    const cardImageConfigs = [
        { style: { width: '20rem' }, cropWidth: 20, cropHeight: 20, minWidth: 20, minHeight: 20, subText: '200x200' },
    ];
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
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeInTheDocument();
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
        const newImage = { id: 20, base64: 'new-image.png', mimeType: 'image/png' } as ImageValues;

        fireEvent.change(imageInput, { target: { value: JSON.stringify(newImage) } });

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

        fireEvent.blur(textarea, { target: { value: '' } });

        await waitFor(() => {
            expect(screen.getByTestId('desc-error-1')).toHaveTextContent(errorMessage);
            const publishButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
            expect(publishButton).toBeDisabled();
        });
    });

    it('should display an image error and disable the publish button', async () => {
        renderComponent();
        const imageInput = screen.getByTestId('mock-image-input-1');

        fireEvent.blur(imageInput);

        await waitFor(() => {
            expect(screen.getByTestId('image-error-1')).toHaveTextContent('test image error');
            const publishButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
            expect(publishButton).toBeDisabled();
        });
    });

    it('should enable the publish button and call onPublish when clicked', () => {
        renderComponent({ isPublishButtonActive: true });

        const publishButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        expect(publishButton).toBeEnabled();

        fireEvent.click(publishButton);
        expect(mockOnPublish).toHaveBeenCalled();
    });

    it('should keep the publish button disabled if there are any validation errors', async () => {
        const errorMessage = 'Description cannot be empty.';
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(errorMessage);

        renderComponent({ isPublishButtonActive: true });

        const textarea = screen.getByTestId('mock-textarea-1');
        fireEvent.blur(textarea, { target: { value: '' } });

        const publishButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });

        await waitFor(() => {
            expect(screen.getByTestId('desc-error-1')).toHaveTextContent(errorMessage);
            expect(publishButton).toBeDisabled();
        });

        expect(mockOnPublish).not.toHaveBeenCalled();
    });
});
