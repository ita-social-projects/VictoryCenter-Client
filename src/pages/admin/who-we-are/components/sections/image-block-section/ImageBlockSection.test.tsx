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
    RichTextInputGroup: ({
        label,
        onChange,
        value,
        maxLength,
        onBlur,
        id,
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
        </div>
    ),
}));

jest.mock('@/validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('ImageSection', () => {
    let mockOnChange: jest.Mock;
    let mockOnPublish: jest.Mock;
    let mockOnTranslate: jest.Mock;

    const titleLimit = 50;
    const descriptionLimit = 500;

    const getPublishButton = () => screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });

    const validateTextMock = () => WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

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
            onTranslate: mockOnTranslate,
            imageInputProps: { style: { width: '100%' }, subText: '1000x800' },
            isPublishButtonActive: false,
            language: { id: 1, code: 'uk', name: 'Ukrainian' },
        };

        return render(<ImageSection {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        mockOnChange = jest.fn();
        mockOnPublish = jest.fn();
        mockOnTranslate = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('should render the component with initial values and no errors', () => {
        renderComponent();

        expect(screen.getByLabelText(WHO_WE_ARE_TEXT.IMAGE.INPUT)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();

        expect(screen.getByTestId('mock-rich-input-2')).toHaveValue('Initial Title');
        expect(screen.getByTestId('mock-rich-input-2')).toHaveAttribute('maxLength', titleLimit.toString());

        expect(screen.getByTestId('mock-rich-input-3')).toHaveValue('Initial Description');
        expect(screen.getByTestId('mock-rich-input-3')).toHaveAttribute('maxLength', descriptionLimit.toString());

        expect(getPublishButton()).toBeDisabled();
    });

    it('should not render if content is undefined or if description content is missing', () => {
        const { container: nullContentContainer } = renderComponent({ content: undefined });
        expect(nullContentContainer).toBeEmptyDOMElement();

        const { container: noDescriptionContainer } = renderComponent({
            content: [
                {
                    id: 1,
                    contentType: ContentType.Image,
                    title: null,
                    description: null,
                    imageId: null,
                    image: null,
                    localizations: [],
                },
                {
                    id: 2,
                    contentType: ContentType.Title,
                    title: null,
                    description: null,
                    imageId: null,
                    image: null,
                    localizations: [],
                },
            ],
        });
        expect(noDescriptionContainer).toBeEmptyDOMElement();
    });

    it('should call onChange on image change', () => {
        renderComponent();

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ contentType: ContentType.Image, image: file }),
        );
    });

    it('should call onChange on title change', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-2'), { target: { value: 'New Title' } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ contentType: ContentType.Title, title: 'New Title' }),
        );
    });

    it('should call onChange on description change', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-3'), { target: { value: 'New Description' } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ contentType: ContentType.Description, description: 'New Description' }),
        );
    });

    it('should enable the publish button and call onPublish when clicked', () => {
        renderComponent({ isPublishButtonActive: true });

        expect(getPublishButton()).toBeEnabled();

        fireEvent.click(getPublishButton());
        expect(mockOnPublish).toHaveBeenCalled();
    });

    it('should display an error from ImageInput', async () => {
        renderComponent({ isPublishButtonActive: true });

        fireEvent.click(screen.getByRole('button', { name: 'Set Error' }));

        expect(await screen.findByText('image size error')).toBeInTheDocument();
    });

    it('should render correctly without title content', () => {
        renderComponent({
            content: [
                {
                    id: 1,
                    contentType: ContentType.Image,
                    image: null,
                    title: null,
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
        });

        expect(screen.queryByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).not.toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
    });

    it('should call onChange with a new image content object if one does not exist', () => {
        renderComponent({
            content: [
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
        });

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({
            contentType: ContentType.Image,
            image: file,
            id: 0,
            description: null,
            title: null,
            imageId: null,
            localizations: [],
        });
    });

    it('should disable publish button when image has error', () => {
        renderComponent({ isPublishButtonActive: true });

        fireEvent.click(screen.getByRole('button', { name: 'Set Error' }));

        expect(getPublishButton()).toBeDisabled();
    });

    it('should validate title on blur', () => {
        renderComponent();

        fireEvent.blur(screen.getByTestId('mock-rich-input-2'));

        expect(validateTextMock()).toHaveBeenCalledWith('Initial Title');
    });

    it('should validate description on blur', () => {
        renderComponent();

        fireEvent.blur(screen.getByTestId('mock-rich-input-3'));

        expect(validateTextMock()).toHaveBeenCalledWith('Initial Description');
    });

    it('should validate empty title on blur when title is null', () => {
        renderComponent({
            content: [
                {
                    id: 1,
                    contentType: ContentType.Image,
                    image: null,
                    title: null,
                    imageId: null,
                    description: null,
                    localizations: [],
                },
                {
                    id: 2,
                    contentType: ContentType.Title,
                    title: null,
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
        });

        fireEvent.blur(screen.getByTestId('mock-rich-input-2'));

        expect(validateTextMock()).toHaveBeenCalledWith('');
    });

    it('should validate empty description on blur when description is null', () => {
        renderComponent({
            content: [
                {
                    id: 1,
                    contentType: ContentType.Image,
                    image: null,
                    title: null,
                    imageId: null,
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
                    description: null,
                    title: null,
                    imageId: null,
                    image: null,
                    localizations: [],
                },
            ],
        });

        fireEvent.blur(screen.getByTestId('mock-rich-input-3'));

        expect(validateTextMock()).toHaveBeenCalledWith('');
    });

    it('should disable publish button when title validation returns error on change', () => {
        renderComponent({ isPublishButtonActive: true });
        validateTextMock().mockReturnValueOnce('ERR');

        fireEvent.change(screen.getByTestId('mock-rich-input-2'), { target: { value: 'any' } });

        expect(getPublishButton()).toBeDisabled();
    });

    it('should disable publish button when description validation returns error on change', () => {
        renderComponent({ isPublishButtonActive: true });
        validateTextMock().mockReturnValueOnce('ERR');

        fireEvent.change(screen.getByTestId('mock-rich-input-3'), { target: { value: 'any' } });

        expect(getPublishButton()).toBeDisabled();
    });

    it('should disable publish button when title validation returns error on blur', () => {
        renderComponent({ isPublishButtonActive: true });
        validateTextMock().mockReturnValueOnce('ERR');

        fireEvent.blur(screen.getByTestId('mock-rich-input-2'));

        expect(getPublishButton()).toBeDisabled();
    });

    it('should disable publish button when description validation returns error on blur', () => {
        renderComponent({ isPublishButtonActive: true });
        validateTextMock().mockReturnValueOnce('ERR');

        fireEvent.blur(screen.getByTestId('mock-rich-input-3'));

        expect(getPublishButton()).toBeDisabled();
    });

    it('should enable publish button after title error is cleared on next change', () => {
        renderComponent({ isPublishButtonActive: true });
        validateTextMock().mockReturnValueOnce('ERR').mockReturnValueOnce(undefined);

        fireEvent.change(screen.getByTestId('mock-rich-input-2'), { target: { value: 'a' } });
        expect(getPublishButton()).toBeDisabled();

        fireEvent.change(screen.getByTestId('mock-rich-input-2'), { target: { value: 'b' } });
        expect(getPublishButton()).toBeEnabled();
    });

    it('should enable publish button after description error is cleared on next change', () => {
        renderComponent({ isPublishButtonActive: true });
        validateTextMock().mockReturnValueOnce('ERR').mockReturnValueOnce(undefined);

        fireEvent.change(screen.getByTestId('mock-rich-input-3'), { target: { value: 'a' } });
        expect(getPublishButton()).toBeDisabled();

        fireEvent.change(screen.getByTestId('mock-rich-input-3'), { target: { value: 'b' } });
        expect(getPublishButton()).toBeEnabled();
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

    it('should validate title on blur for base language', () => {
        renderComponent();

        const titleInput = screen.getByTestId('mock-rich-input-2');

        fireEvent.change(titleInput, { target: { value: 'invalid text' } });

        fireEvent.blur(titleInput);

        expect(WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText).toHaveBeenCalled();
    });

    it('should validate description on blur for base language', () => {
        renderComponent();

        const descInput = screen.getByTestId('mock-rich-input-3');

        fireEvent.change(descInput, { target: { value: 'invalid text' } });

        fireEvent.blur(descInput);

        expect(WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText).toHaveBeenCalled();
    });

    it('should not validate title or description on blur for non-base language', () => {
        renderComponent({ language: { id: 2, code: 'en', name: 'English' } });

        const titleInput = screen.getByTestId('mock-rich-input-2');
        const descInput = screen.getByTestId('mock-rich-input-3');

        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockClear();

        fireEvent.blur(titleInput);
        fireEvent.blur(descInput);

        expect(WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText).not.toHaveBeenCalled();
    });
});
