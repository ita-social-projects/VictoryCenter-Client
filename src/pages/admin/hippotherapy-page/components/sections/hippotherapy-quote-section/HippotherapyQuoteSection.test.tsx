import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HippotherapyQuoteSection, HippotherapyQuoteSectionProps } from './HippotherapyQuoteSection';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyQuoteContent } from '@/types/admin/hippotherapy-page';

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
    RichTextInputGroup: ({ label, onChange, value, id, disabled, error }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => !disabled && onChange(e.target.value)}
                value={value}
                id={id}
                disabled={disabled}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('HippotherapyQuoteSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippotherapyQuoteContent = {
        quoteText: 'Initial quote',
        authorName: 'Initial author',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<HippotherapyQuoteSectionProps> = {}) =>
        render(
            <HippotherapyQuoteSection
                value={defaultValue}
                onChange={mockOnChange}
                fieldIdPrefix="test-quote"
                {...props}
            />,
        );

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders the quote text and author name fields', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('mock-rich-input-test-quote-quote-text')).toHaveValue('Initial quote');
        expect(screen.getByTestId('mock-rich-input-test-quote-quote-author')).toHaveValue('Initial author');
    });

    it('calls onChange with the updated image', () => {
        renderComponent();

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, image: file });
    });

    it('calls onChange with the updated quote text', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-quote-quote-text'), {
            target: { value: 'New quote' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, quoteText: 'New quote' });
    });

    it('calls onChange with the updated author name', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-quote-quote-author'), {
            target: { value: 'New author' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, authorName: 'New author' });
    });

    it('shows an image error reported by ImageInput', () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: 'Set Error' }));

        expect(screen.getByText('image size error')).toBeInTheDocument();
    });

    it('reports the image error to the parent via onImageError', () => {
        const onImageError = jest.fn();
        renderComponent({ onImageError });

        fireEvent.click(screen.getByRole('button', { name: 'Set Error' }));

        expect(onImageError).toHaveBeenCalledWith('image size error');
    });

    it('disables all inputs when disabled is true', () => {
        renderComponent({ disabled: true });

        expect(screen.getByTestId('mock-image-input-file')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-test-quote-quote-text')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-test-quote-quote-author')).toBeDisabled();
    });
});
