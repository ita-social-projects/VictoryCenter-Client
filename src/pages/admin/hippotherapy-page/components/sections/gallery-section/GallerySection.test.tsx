import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GallerySection, GallerySectionProps } from './GallerySection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyGallerySectionContent } from '@/types/admin/hippotherapy-page';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');

jest.mock('@/components/admin/image-input/ImageInput');

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('GallerySection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippotherapyGallerySectionContent = {
        title: 'Initial title',
        cards: [
            { description: 'Card one', image: null, imageId: null },
            { description: 'Card two', image: null, imageId: null },
        ],
    };

    const renderComponent = (props: Partial<GallerySectionProps> = {}) =>
        render(<GallerySection value={defaultValue} onChange={mockOnChange} fieldIdPrefix="test-gallery" {...props} />);

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders the title and one image/description pair per card', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getAllByTestId('mock-image-input')).toHaveLength(2);
        expect(screen.getByTestId('mock-rich-input-test-gallery-card-0-description')).toHaveValue('Card one');
        expect(screen.getByTestId('mock-rich-input-test-gallery-card-1-description')).toHaveValue('Card two');
    });

    it('calls onChange with the updated title', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-gallery-title'), {
            target: { value: 'New title' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, title: 'New title' });
    });

    it('updates only the targeted card image, leaving the others untouched', () => {
        renderComponent();

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getAllByTestId('mock-image-input-file')[1], { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({
            ...defaultValue,
            cards: [defaultValue.cards[0], { ...defaultValue.cards[1], image: file }],
        });
    });

    it('updates only the targeted card description, leaving the others untouched', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-gallery-card-0-description'), {
            target: { value: 'Updated card one' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({
            ...defaultValue,
            cards: [{ ...defaultValue.cards[0], description: 'Updated card one' }, defaultValue.cards[1]],
        });
    });

    it('shows an image error scoped to the card that reported it', () => {
        renderComponent();

        fireEvent.click(screen.getAllByRole('button', { name: 'Set Error' })[0]);

        expect(screen.getByText('image size error')).toBeInTheDocument();
    });

    it('reports the card index and error to the parent via onCardImageError', () => {
        const onCardImageError = jest.fn();
        renderComponent({ onCardImageError });

        fireEvent.click(screen.getAllByRole('button', { name: 'Set Error' })[1]);

        expect(onCardImageError).toHaveBeenCalledWith(1, 'image size error');
    });

    it('shows a card description error on blur', () => {
        validateTextMock().mockReturnValueOnce('Too short');
        renderComponent();

        fireEvent.blur(screen.getByTestId('mock-rich-input-test-gallery-card-0-description'));

        expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    it('does not show an error on the card description when the image input is blurred', () => {
        validateTextMock().mockReturnValue('Too short');
        renderComponent();

        fireEvent.blur(screen.getAllByTestId('mock-image-input-file')[0]);

        expect(screen.queryByText('Too short')).not.toBeInTheDocument();
    });

    it('disables every card input when disabled is true', () => {
        renderComponent({ disabled: true });

        screen.getAllByTestId('mock-image-input-file').forEach((input) => expect(input).toBeDisabled());
        expect(screen.getByTestId('mock-rich-input-test-gallery-card-0-description')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-test-gallery-card-1-description')).toBeDisabled();
    });
});
