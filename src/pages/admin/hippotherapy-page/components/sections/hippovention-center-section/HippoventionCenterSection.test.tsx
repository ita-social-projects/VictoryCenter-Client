import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HippoventionCenterSection, HippoventionCenterSectionProps } from './HippoventionCenterSection';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippoventionCenterSectionContent } from '@/types/admin/hippotherapy-page';

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: require('@/utils/test-mocks/hippotherapy-page-mocks').MockImageInput,
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: require('@/utils/test-mocks/hippotherapy-page-mocks').MockRichTextInputGroup,
}));

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('HippoventionCenterSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippoventionCenterSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        pros: 'Initial pros',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<HippoventionCenterSectionProps> = {}) =>
        render(<HippoventionCenterSection value={defaultValue} onChange={mockOnChange} {...props} />);

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders title, image, pros, and description', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('mock-rich-input-hippovention-center-pros')).toHaveValue('Initial pros');
    });

    it('calls onChange with the updated image', () => {
        renderComponent();

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, image: file });
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

    it('calls onChange with the updated title', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippovention-center-title'), {
            target: { value: 'New title' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, title: 'New title' });
    });

    it('calls onChange with the updated pros text', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippovention-center-pros'), {
            target: { value: 'Updated pros' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, pros: 'Updated pros' });
    });

    it('calls onChange with the updated description', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippovention-center-description'), {
            target: { value: 'New description' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, description: 'New description' });
    });

    it('shows a validation error when the pros text is invalid', () => {
        validateTextMock().mockReturnValueOnce('Too short');
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippovention-center-pros'), {
            target: { value: 'x' },
        });
        fireEvent.blur(screen.getByTestId('mock-rich-input-hippovention-center-pros'));

        expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    it('disables all inputs when disabled is true', () => {
        renderComponent({ disabled: true });

        expect(screen.getByTestId('mock-image-input-file')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippovention-center-title')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippovention-center-pros')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippovention-center-description')).toBeDisabled();
    });
});
