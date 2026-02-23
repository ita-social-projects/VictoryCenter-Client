import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageSection, ImageSectionProps } from './ImageBlockSection';
import { ContentType } from '@/types/common/about-us';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { Image } from '@/types/common/image';
import { RichTextInputGroupProps } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, label, setError, disabled }: any) => (
        <div data-testid="mock-image-input">
            <label htmlFor="mock-image-input-id">{label}</label>
            <input
                data-testid="mock-image-input-file"
                type="file"
                id="mock-image-input-id"
                disabled={disabled}
                onChange={(e) => !disabled && onChange(e.target.files?.[0])}
            />
            <button onClick={() => !disabled && setError('image size error')}>Set Error</button>
        </div>
    ),
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ label, onChange, value, maxLength, onBlur, id, disabled }: RichTextInputGroupProps & { disabled?: boolean }) => (
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
        </div>
    ),
}));

jest.mock('@/validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn((value: string) => {
            if (value === 'invalid text') {
                return 'Текст невалідний.';
            }
            return undefined;
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
                {
                    id: 1,
                    contentType: ContentType.Image,
                    image: { id: 1, url: 'https://example.com/card/1', mimeType: 'image/png' } as Image,
                    title: null,
                    imageId: 1,
                    description: null,
                    localizations: [],
                },
                {
                    id: 2,
                    contentType: ContentType.Title,
                    title: 'Initial Title',
                    image: null,
                    imageId: null,
                    description: null,
                    localizations: [],
                },
                {
                    id: 3,
                    contentType: ContentType.Description,
                    description: 'Initial Description',
                    title: null,
                    imageId: null,
                    image: null,
                    localizations: [],
                },
            ],
            titleLimit,
            descriptionLimit,
            onChange: mockOnChange,
            onPublish: mockOnPublish,
            imageInputProps: { style: { width: '100%' }, subText: '1000x800' },
            isPublishButtonActive: false,
            setIsPublishButtonActive: mockSetIsPublishButtonActive,
            language: { id: 1, code: 'uk', name: 'Ukrainian' },
        };
        return render(<ImageSection {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        mockOnChange = jest.fn();
        mockOnPublish = jest.fn();
        mockSetIsPublishButtonActive = jest.fn();
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockClear();
    });

    it('should render the component with initial values and no errors', () => {
        renderComponent();
        expect(screen.getByLabelText(WHO_WE_ARE_TEXT.IMAGE.INPUT)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        const titleInput = screen.getByTestId('mock-rich-input-2');
        expect(titleInput).toHaveValue('Initial Title');
        expect(titleInput).toHaveAttribute('maxLength', titleLimit.toString());
        const descriptionInput = screen.getByTestId('mock-rich-input-3');
        expect(descriptionInput).toHaveValue('Initial Description');
        expect(descriptionInput).toHaveAttribute('maxLength', descriptionLimit.toString());
        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeDisabled();
    });

    it('should not render if content is undefined or if description content is missing', () => {
        const { container: nullContentContainer } = renderComponent({ content: undefined });
        expect(nullContentContainer).toBeEmptyDOMElement();
        const { container: noDescriptionContainer } = renderComponent({
            content: [
                { id: 1, contentType: ContentType.Image, title: null, description: null, imageId: null, image: null, localizations: [] },
                { id: 2, contentType: ContentType.Title, title: null, description: null, imageId: null, image: null, localizations: [] },
            ],
        });
        expect(noDescriptionContainer).toBeEmptyDOMElement();
    });

    it('should call onChange and setIsPublishButtonActive on image change', () => {
        renderComponent();
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('mock-image-input-file');
        fireEvent.change(input, { target: { files: [file] } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ contentType: ContentType.Image, image: file }),
        );
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should call onChange and setIsPublishButtonActive on title change', () => {
        renderComponent();
        const titleInput = screen.getByTestId('mock-rich-input-2');
        const newTitle = 'New Title';
        fireEvent.change(titleInput, { target: { value: newTitle } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ contentType: ContentType.Title, title: newTitle }),
        );
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should call onChange and setIsPublishButtonActive on description change', () => {
        renderComponent();
        const descriptionInput = screen.getByTestId('mock-rich-input-3');
        const newDescription = 'New Description';
        fireEvent.change(descriptionInput, { target: { value: newDescription } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ contentType: ContentType.Description, description: newDescription }),
        );
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should enable the publish button and call onPublish when clicked', () => {
        renderComponent({ isPublishButtonActive: true });
        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeEnabled();
        fireEvent.click(publishButton);
        expect(mockOnPublish).toHaveBeenCalled();
    });

    it('should display an error from ImageInput', async () => {
        renderComponent({ isPublishButtonActive: true });

        const setErrorButton = screen.getByRole('button', { name: 'Set Error' });
        fireEvent.click(setErrorButton);

        expect(await screen.findByText('image size error')).toBeInTheDocument();
    });

    it('should render correctly without title content', () => {
        renderComponent({
            content: [
                { id: 1, contentType: ContentType.Image, image: null, title: null, imageId: null, description: null, localizations: [] },
                {
                    id: 3,
                    contentType: ContentType.Description,
                    description: 'Initial Description',
                    title: null,
                    imageId: null,
                    image: null,
                    localizations: [],
                },
            ],
        });
        expect(screen.queryByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).not.toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
    });

    it('should call onChange with a new image content object if one does not exist', () => {
        const contentWithoutImage = [
            {
                id: 2,
                contentType: ContentType.Title,
                title: 'Initial Title',
                image: null,
                imageId: null,
                description: null,
                localizations: [],
            },
            {
                id: 3,
                contentType: ContentType.Description,
                description: 'Initial Description',
                title: null,
                imageId: null,
                image: null,
                localizations: [],
            },
        ];
        renderComponent({ content: contentWithoutImage });

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('mock-image-input-file');
        fireEvent.change(input, { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({
            contentType: ContentType.Image,
            image: file,
            id: 0,
            description: null,
            title: null,
            imageId: null,
            localizations: [],
        });
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    it('should disable publish button when image has error', () => {
        renderComponent({ isPublishButtonActive: true });

        const setErrorButton = screen.getByRole('button', { name: 'Set Error' });
        fireEvent.click(setErrorButton);

        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeDisabled();
    });

    it('should not call onChange when titleContent is missing', () => {
        renderComponent({
            content: [
                { id: 1, contentType: ContentType.Image, image: null, title: null, imageId: null, description: null, localizations: [] },
                {
                    id: 3,
                    contentType: ContentType.Description,
                    description: 'Initial Description',
                    title: null,
                    imageId: null,
                    image: null,
                    localizations: [],
                },
            ],
        });
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should prevent edits and hide publish button for non-base language', () => {
        renderComponent({ language: { id: 2, code: 'en', name: 'English' } });

        const titleInput = screen.getByTestId('mock-rich-input-2');
        expect(titleInput).toBeDisabled();
        fireEvent.change(titleInput, { target: { value: 'Attempt title change' } });
        expect(mockOnChange).not.toHaveBeenCalled();

        const descriptionInput = screen.getByTestId('mock-rich-input-3');
        expect(descriptionInput).toBeDisabled();
        fireEvent.change(descriptionInput, { target: { value: 'Attempt desc change' } });
        expect(mockOnChange).not.toHaveBeenCalled();

        const imageInput = screen.getByTestId('mock-image-input-file');
        expect(imageInput).toBeDisabled();

        expect(screen.queryByRole('button', { name: 'Опублікувати' })).not.toBeInTheDocument();
    });
});
