import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroBannerSection, IntroBannerSectionProps } from './IntroBannerSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyIntroSectionContent } from '@/types/admin/hippotherapy-page';

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
            <button type="button" onClick={() => !disabled && setError('image size error')}>
                Set Error
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ label, onChange, onBlur, value, maxLength, id, disabled, error }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => !disabled && onChange(e.target.value)}
                onBlur={() => !disabled && onBlur?.()}
                value={value}
                maxLength={maxLength}
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

describe('IntroBannerSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippotherapyIntroSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<IntroBannerSectionProps> = {}) =>
        render(<IntroBannerSection value={defaultValue} onChange={mockOnChange} {...props} />);

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders the initial title and description', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('mock-rich-input-hippotherapy-intro-title')).toHaveValue('Initial title');
        expect(screen.getByTestId('mock-rich-input-hippotherapy-intro-description')).toHaveValue('Initial description');
    });

    it('calls onChange with the updated image', () => {
        renderComponent();

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, image: file });
    });

    it('calls onChange with the updated title', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-intro-title'), {
            target: { value: 'New title' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, title: 'New title' });
    });

    it('calls onChange with the updated description', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-intro-description'), {
            target: { value: 'New description' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, description: 'New description' });
    });

    it('shows an error message reported by ImageInput', () => {
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

    it('shows a title validation error when validation fails', () => {
        validateTextMock().mockReturnValueOnce('Title is too short');
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-intro-title'), {
            target: { value: 'x' },
        });
        fireEvent.blur(screen.getByTestId('mock-rich-input-hippotherapy-intro-title'));

        expect(screen.getByText('Title is too short')).toBeInTheDocument();
    });

    it('disables inputs when disabled is true', () => {
        renderComponent({ disabled: true });

        expect(screen.getByTestId('mock-image-input-file')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippotherapy-intro-title')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippotherapy-intro-description')).toBeDisabled();
    });
});
